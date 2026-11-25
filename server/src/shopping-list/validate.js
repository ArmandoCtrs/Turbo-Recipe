import { renderQuantity } from "./render.js";

// Single source of truth for category names. index.js imports this for sorting.
// "Beverages" must match the category list inside the prompt in index.js.
const CATEGORIES = [
  "Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread",
  "Pantry & Dry Goods", "Spices & Seasonings", "Condiments & Sauces",
  "Frozen", "Beverages", "Other",
];

const normId = (id) => String(id).trim();

/**
 * A vague compound string ("salt and pepper to taste") names two ingredients, so
 * its ID may legitimately be listed under more than one item. Only the part before
 * the first comma is checked, so "500g shrimp, peeled and deveined" does not count.
 */
const isCompound = (text) => /\b(and|&)\b/i.test(String(text).split(",")[0]);

function parseModelJson(text) {
  const cleaned = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

/**
 * Every source ID must appear at least once across item sources + unparsed.
 * An ID may appear more than once only if its string is a compound string.
 * IDs that are not in the lookup are reported as unknown.
 */
function checkSourceCoverage(lookup, response) {
  const counts = new Map();
  const unknown = [];
  const tally = (raw) => {
    const id = normId(raw);
    if (lookup.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    else unknown.push(id);
  };

  for (const cat of response.categories ?? [])
    for (const item of cat.items ?? [])
      // Set: the same ID listed twice inside one item is not a real duplicate.
      for (const id of new Set((item.sources ?? []).map(normId))) tally(id);
  for (const id of response.unparsed ?? []) tally(id);

  const missing = [];
  const duplicated = [];
  for (const [id, entry] of lookup) {
    const n = counts.get(id) ?? 0;
    if (n === 0) missing.push(id);
    else if (n > 1 && !isCompound(entry.text)) duplicated.push(id);
  }
  return { missing, duplicated, unknown };
}

function checkStructure(response) {
  const errors = [];
  if (!Array.isArray(response?.categories)) return ["'categories' is missing or not an array"];
  if (response.unparsed !== undefined && !Array.isArray(response.unparsed)) {
    errors.push("'unparsed' must be an array of source IDs");
  }
  for (const cat of response.categories) {
    if (!CATEGORIES.includes(cat.name)) errors.push(`unknown category "${cat.name}"`);
    if (!Array.isArray(cat.items)) { errors.push(`category "${cat.name}" has no items array`); continue; }
    for (const it of cat.items) {
      if (typeof it.item !== "string" || !it.item) errors.push("an item has no name");
      if (typeof it.quantity !== "string") errors.push(`"${it.item}" has no quantity string`);
      if (!Array.isArray(it.sources) || it.sources.length === 0 || !it.sources.every((s) => typeof s === "string")) {
        errors.push(`"${it.item}" must have a non-empty sources array of source ID strings`);
      }
    }
  }
  return errors;
}

/**
 * Validates and renders one model response.
 * ctx is { input, lookup } from buildInput.
 * Returns { critical: string[], soft: string[], rendered, coverage, notes, unparsed }.
 * Every source in the result is a full object: { id, recipeId, recipeName, field, index, text }.
 */
function validateAndRender(ctx, response) {
  const { lookup } = ctx;

  const criticalErrors = checkStructure(response);
  if (criticalErrors.length) return { critical: criticalErrors, soft: [], rendered: null, coverage: null };

  const critical = [];
  const softWarnings = [];

  const coverage = checkSourceCoverage(lookup, response);
  if (coverage.unknown.length) {
    critical.push(`These source IDs do not exist in the input: ${JSON.stringify(coverage.unknown)}. Use only IDs from the input.`);
  }
  if (coverage.missing.length) {
    const listed = coverage.missing.map((id) => `${id} (${lookup.get(id).text})`);
    critical.push(`These source IDs are missing from sources/unparsed: ${JSON.stringify(listed)}`);
  }
  if (coverage.duplicated.length) {
    const listed = coverage.duplicated.map((id) => `${id} (${lookup.get(id).text})`);
    critical.push(`These source IDs appear in more than one place. An ID may appear once, unless its string names two ingredients: ${JSON.stringify(listed)}`);
  }

  const resolve = (id) => lookup.get(normId(id));

  const rendered = response.categories.map((cat) => ({
    name: cat.name,
    lines: cat.items.map((item) => {
      const { text, warnings } = renderQuantity(item.quantity, {
        approximate: item.approximate,
      });
      for (const w of warnings) {
        const msg = `"${item.item}": ${w.message}`;
        (w.level === "critical" ? critical : softWarnings).push(msg);
      }

      // Unknown IDs were already reported as critical above; drop them here.
      const sources = [...new Set(item.sources.map(normId))].map(resolve).filter(Boolean);

      // Recipe attribution is derived from the sources, never written by the model.
      const byRecipe = new Map(sources.map((s) => [s.recipeId, s.recipeName]));

      return {
        item: item.item,
        quantity: text,
        recipeIds: [...byRecipe.keys()],
        recipes: [...byRecipe.values()],
        sources,
      };
    }),
  }));

  return {
    critical,
    soft: softWarnings,
    rendered,
    coverage,
    notes: response.notes ?? [],
    unparsed: (response.unparsed ?? []).map(resolve).filter(Boolean),
  };
}

/**
 * Calls the model, validates, and retries with error feedback on critical problems.
 *
 * ctx = { input, lookup } from buildInput in index.js.
 *
 * callModel(ctx, feedback) -> Promise<string>
 *   feedback is null on the first call. On retries it is a string you should append
 *   to the conversation as a follow-up user message, e.g.:
 *     "Your previous answer had problems. Fix them and return the full corrected JSON.\n" + feedback
 */
async function buildShoppingList(ctx, callModel, { maxAttempts = 3 } = {}) {
  let feedback = null;
  let last = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await callModel(ctx, feedback);

    let response;
    try {
      response = parseModelJson(text);
    } catch (err) {
      feedback = `Your output was not valid JSON (${err.message}). Return ONLY valid JSON.`;
      last = { critical: [feedback], soft: [], rendered: null, coverage: null };
      continue;
    }

    const result = validateAndRender(ctx, response);
    last = result;
    if (result.critical.length === 0) {
      return { ok: true, attempts: attempt, ...result, unsorted: [] };
    }
    feedback = result.critical.join("\n");
  }

  // Graceful degradation: never lose an ingredient.
  // Show whatever rendered, and list every source that was never placed as "Unsorted".
  const missingIds = last?.coverage?.missing ?? [...ctx.lookup.keys()];
  return {
    ok: false,
    attempts: maxAttempts,
    ...last,
    unsorted: missingIds.map((id) => ctx.lookup.get(id)),
  };
}

export { buildShoppingList, validateAndRender, checkSourceCoverage, parseModelJson, CATEGORIES };