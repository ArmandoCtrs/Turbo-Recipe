import { renderQuantity } from "./render.js";

const CATEGORIES = [
  "Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread",
  "Pantry & Dry Goods", "Spices & Seasonings", "Condiments & Sauces",
  "Frozen", "Beverages & Alcohol", "Other",
];

// Forgiving comparison: collapse whitespace and curly quotes, nothing else.
const norm = (s) =>
  String(s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();

const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

function parseModelJson(text) {
  const cleaned = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

/** Multiset comparison: every input string exactly once across sources + unparsed. */
function checkSourceCoverage(recipes, response) {
  const expected = new Map();
  const actual = new Map();
  for (const list of Object.values(recipes)) for (const s of list) bump(expected, norm(s));
  for (const cat of response.categories ?? [])
    for (const item of cat.items ?? [])
      for (const s of item.sources ?? []) bump(actual, norm(s));
  for (const s of response.unparsed ?? []) bump(actual, norm(s));

  const missing = [];
  const extra = [];
  for (const [s, n] of expected) {
    const diff = n - (actual.get(s) ?? 0);
    for (let k = 0; k < diff; k++) missing.push(s);
  }
  for (const [s, n] of actual) {
    const diff = n - (expected.get(s) ?? 0);
    for (let k = 0; k < diff; k++) extra.push(s);
  }
  return { missing, extra };
}

function checkStructure(response) {
  const errors = [];
  if (!Array.isArray(response?.categories)) return ["'categories' is missing or not an array"];
  for (const cat of response.categories) {
    if (!CATEGORIES.includes(cat.name)) errors.push(`unknown category "${cat.name}"`);
    if (!Array.isArray(cat.items)) { errors.push(`category "${cat.name}" has no items array`); continue; }
    for (const it of cat.items) {
      if (typeof it.item !== "string" || !it.item) errors.push("an item has no name");
      if (typeof it.quantity !== "string") errors.push(`"${it.item}" has no quantity string`);
      if (!Array.isArray(it.sources) || it.sources.length === 0) errors.push(`"${it.item}" has no sources`);
    }
  }
  return errors;
}

/**
 * Validates and renders one model response.
 * Returns { critical: string[], soft: string[], rendered, coverage }.
 */
function validateAndRender(recipes, response) {
  const criticalErrors = checkStructure(response);
  if (criticalErrors.length) return { critical: criticalErrors, soft: [], rendered: null, coverage: null };

  const critical = [];
  const softWarnings = [];

  const coverage = checkSourceCoverage(recipes, response);
  if (coverage.missing.length) critical.push(`These input strings are missing from sources/unparsed: ${JSON.stringify(coverage.missing)}`);
  if (coverage.extra.length) critical.push(`These strings in sources/unparsed are duplicated or do not match the input exactly: ${JSON.stringify(coverage.extra)}`);

  const recipeNames = new Set(Object.keys(recipes));
  const rendered = response.categories.map((cat) => ({
    name: cat.name,
    lines: cat.items.map((item) => {
      const { text, warnings } = renderQuantity(item.quantity, {
        approximate: item.approximate
      });
      for (const w of warnings) {
        const msg = `"${item.item}": ${w.message}`;
        (w.level === "critical" ? critical : softWarnings).push(msg);
      }
      for (const r of item.recipes ?? []) {
        if (!recipeNames.has(r)) softWarnings.push(`"${item.item}": unknown recipe name "${r}"`);
      }
      return {
        item: item.item,
        quantity: text,
        recipes: item.recipes ?? [],
        sources: item.sources
      };
    }),
  }));

  return { critical, soft: softWarnings, rendered, coverage,
            notes: response.notes ?? [], unparsed: response.unparsed ?? [] };
}

/**
 * Calls the model, validates, and retries with error feedback on critical problems.
 *
 * callModel(recipes, feedback) -> Promise<string>
 *   feedback is null on the first call. On retries it is a string you should append
 *   to the conversation as a follow-up user message, e.g.:
 *     "Your previous answer had problems. Fix them and return the full corrected JSON.\n" + feedback
 */
async function buildShoppingList(recipes, callModel, { maxAttempts = 3 } = {}) {
  let feedback = null;
  let last = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const text = await callModel(recipes, feedback);

    let response;
    try {
      response = parseModelJson(text);
    } catch (err) {
      feedback = `Your output was not valid JSON (${err.message}). Return ONLY valid JSON.`;
      last = { critical: [feedback], soft: [], rendered: null, coverage: null };
      continue;
    }

    const result = validateAndRender(recipes, response);
    last = result;
    if (result.critical.length === 0) {
      return { ok: true, attempts: attempt, ...result, unsorted: [] };
    }
    feedback = result.critical.join("\n");
  }

  // Graceful degradation: never lose an ingredient.
  // Show whatever rendered, and list any missing input strings verbatim as "Unsorted".
  return {
    ok: false,
    attempts: maxAttempts,
    ...last,
    unsorted: last?.coverage?.missing ?? Object.values(recipes).flat(),
  };
}

export { buildShoppingList, validateAndRender, checkSourceCoverage, parseModelJson, CATEGORIES };