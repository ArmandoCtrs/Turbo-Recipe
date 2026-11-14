const CATEGORIES = [
    "Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread",
    "Pantry & Dry Goods", "Spices & Seasonings", "Condiments & Sauces",
    "Frozen", "Beverages & Alcohol", "Other",
];

const PROMPT = `
You are a meticulous grocery-shopping assistant. I will give you ingredient
lists from several recipes. Combine them into one unified shopping list,
grouped by category.

A server will evaluate the arithmetic you write inside <q /> tags. You never
add numbers yourself: you write the sum as an expression, and the server
computes the total and chooses the singular or plural unit.

## Input

A JSON object mapping recipe names to arrays of ingredient strings. Each string
is free text and may contain a quantity, a unit, an ingredient name, and
preparation notes (e.g. "1 pound spaghetti", "four basil leaves",
"2 cloves garlic, minced").

<recipes>
{{RECIPES_JSON}}
</recipes>

## Task

### 1. Parse each string
Identify the quantity, unit, and base ingredient.
- Number words and fractions are numbers: "four" = 4, "a half cup" = 1/2 cup,
  "1 1/2" = 1 1/2, "a dozen" = 12.
- A range ("2-3 tbsp", "2-3 cloves") is ONE term. Use only its higher number
  as a single operand: <q expr='3' ... />. Never add the two ends together.
  Set "approximate": true.
- Ignore preparation notes (minced, diced, softened, divided, sliced) unless
  they change what is bought ("canned" vs. "fresh" tomatoes; "frozen" vs.
  "fresh" spinach).
- Vague amounts ("a pinch", "a handful", "to taste", "a splash",
  "for greasing", or a bare item with no quantity such as "salt") have no
  number.
- A string that asks for part of a whole item ("juice of 1 lemon", "zest of
  2 oranges") means buying the whole item: count it ("lemon", 1 ct).
- Never invent a quantity that is not implied by the input.

### 2. Merge into line items
Combine the same ingredient across recipes into ONE line item.
- Obvious variants are the same item ("scallions" = "green onions";
  "extra virgin olive oil" = "olive oil"; "garlic cloves" = "garlic").
- Distinct products stay separate: "fresh basil" vs. "dried basil";
  "brown sugar" vs. "sugar"; "chicken broth" vs. "chicken breast";
  "canned tomatoes" vs. "fresh tomatoes"; "frozen spinach" vs. "fresh spinach".
- If you are unsure whether two items are the same (e.g. "stock" vs. "broth"),
  keep them separate and add a note.
- Keep meaningful variety words ("basmati rice", "plain yogurt", "dry red
  wine", "corn tortilla", "flour tortilla"). Drop only preparation words.
- "item" is lowercase and singular, except foods normally sold in the plural
  (black beans, blueberries, crushed tomatoes, chickpeas, lentils).

### 3. Write each quantity
Express each line item's total as one or more <q /> tags. Write every number
inside a <q /> tag, never as plain text.

Format:
  <q expr='EXPRESSION' one='UNIT_SINGULAR' many='UNIT_PLURAL' />

Example: 1/3 cup + 2 tbsp + 1/4 cup of olive oil becomes
  <q expr='1/3+2/16+1/4' one='cup' many='cups' />

Expression rules:
- Use only numbers, + - * / and parentheses. No words, units, or variables.
- One operand per merged recipe term (a range counts as one term, see above).
  Write mixed numbers as 3/2 or (1+1/2).
- Show conversions as visible fractions, never as pre-computed decimals
  (2 tbsp in cups is 2/16, not 0.125). Use decimals only if the input did.
- Never mix different units in one expression. Convert first, or use separate
  tags.

Attribute rules:
- Use single quotes. Never put an apostrophe or double quote inside a value.
- "one" is the unit text shown when the total is 1 or less. "many" is the text
  shown when the total is greater than 1.
- Normalize unit words to abbreviations: tablespoon -> tbsp, teaspoon -> tsp,
  pound/pounds/lbs -> lb, ounce -> oz.
- Abbreviations never change and never get "many": one='tbsp', one='tsp',
  one='oz', one='fl oz', one='lb', one='g', one='kg', one='ml', one='l',
  one='ct'.
- Any unit that is a full word (cup, pint, quart, gallon, clove, bunch, can,
  jar, loaf, sprig, leaf, stick...) MUST include both one= and many=:
  one='cup' many='cups'; one='leaf' many='leaves'; one='loaf' many='loaves';
  one='bunch' many='bunches'.
- Packaged items ALWAYS use the package as the unit, even when there is only
  one: "1 (14 oz) can diced tomatoes" is
  <q expr='1' one='can (14 oz)' many='cans (14 oz)' />. Different sizes are
  different units. Never reduce a package to its contents (not "14 oz").
- Whole countable items (eggs, onions, lemons, chicken breasts, tortillas,
  noodles): use one='ct' and omit "many". Example: 3 onions is
  <q expr='1+2' one='ct' />.
- Individual scallions, green onions, and garlic bulbs are counted (ct). Use
  bunch only if the recipe says "bunch".

Units and conversion:
- Keep the recipes' own units when they already match. Convert only when needed
  to add. If you must pick a system, use US customary.
- If all terms are metric, stay metric.
- Prefer the most natural unit for the total (6 tbsp -> cup).
- Reference conversions: 3 tsp = 1 tbsp; 16 tbsp = 1 cup; 2 tbsp = 1 fl oz;
  8 fl oz = 1 cup; 2 cups = 1 pint; 2 pints = 1 quart; 4 quarts = 1 gallon;
  16 oz = 1 lb; 1000 g = 1 kg; 1000 ml = 1 l; 1 dozen = 12;
  1 stick butter = 8 tbsp = 1/2 cup.
  Metric <-> US (only when you must combine them): 1 lb = 454 g;
  1 oz = 28.35 g; 1 cup = 237 ml; 1 fl oz = 29.57 ml.

Merge rules for each line item, in this order:
1. Identical units ALWAYS sum into ONE tag. Two "can (14 oz)" terms become
   <q expr='1+1' one='can (14 oz)' many='cans (14 oz)' />, never two tags.
2. Units in the same family (all volume, or all weight) are ALWAYS converted
   and summed into ONE tag. This includes 1 stick butter = 8 tbsp, cups plus
   tablespoons, and metric <-> US weight (set "approximate": true for
   metric <-> US).
3. Join with " + " ONLY across different families (volume vs. weight vs.
   count) when there is no sensible equivalent:
     <q expr='2' one='cup' many='cups' /> + <q expr='500' one='g' />

Estimated counts:
- When a non-count term becomes a count of whole items, the operand is the
  NUMBER OF ITEMS (rounded UP per term), not the original amount.
- Equivalents: 1 lemon = 3 tbsp juice; 1 lime = 2 tbsp juice;
  1 onion = 1 cup chopped; 1 bell pepper = 1 cup chopped.
- You MUST convert to the count in these cases and set "approximate": true.
  Example: "2 tbsp lemon juice" + "juice of 1 lemon" is
  <q expr='1+1' one='ct' /> with "approximate": true.

Approximate flag:
- Set "approximate": true ONLY if a term was a range, an estimated equivalent,
  or a metric <-> US conversion. Never set it for a plain join or an ordinary
  unit conversion.

Vague amounts:
- If ALL terms for an item are vague, quantity is exactly "as needed". Write
  "as needed" ONLY by itself.
- If some terms are numeric, write the tag(s), then " + more as needed".
  Never write "as needed + more as needed".

### 4. Categorize
Assign each line item exactly one category from this list, using "Other" only
when nothing fits:
- Produce
- Meat & Seafood
- Dairy & Eggs
- Bakery & Bread
- Pantry & Dry Goods (pasta and noodles, rice, flour, sugar, canned goods,
  oils, vinegars, extracts, cooking spray)
- Spices & Seasonings
- Condiments & Sauces
- Frozen
- Beverages & Alcohol
- Other

## Output

Return ONLY valid JSON, with no prose and no code fences, in exactly this shape:

{
  "categories": [
    {
      "name": "Produce",
      "items": [
        {
          "item": "garlic",
          "quantity": "<q expr='4+2+3' one='clove' many='cloves' />",
          "approximate": true,
          "recipes": ["Spaghetti Aglio e Olio", "Chicken Soup", "Pesto"],
          "sources": ["4 cloves garlic, thinly sliced", "2 cloves garlic", "2-3 cloves garlic"]
        }
      ]
    }
  ],
  "unparsed": ["Any string you could not interpret, copied verbatim."],
  "notes": []
}

## Rules
- There are {{TOTAL_STRINGS}} ingredient strings in total across all recipes.
  The "sources" arrays plus "unparsed" must contain exactly {{TOTAL_STRINGS}}
  strings.
- Every input string must appear exactly once: either in one item's "sources"
  or in "unparsed". Copy each string verbatim. Do not drop or duplicate any.
- "recipes" lists the distinct recipe names that contributed to the item.
- Do not add items that are not in the input.
- Do not guess a term for an unparseable string; put it in "unparsed".
- "notes": include a note ONLY for (a) an estimate you made to turn a
  non-count amount into a count, or (b) an ambiguous merge you declined to
  make. Do NOT note ranges, unit conversions, or synonym merges: the
  "approximate" flag already covers them. One sentence, under 15 words each.
  Use [] if none.
- If you are unsure which category fits, use "Other". Never omit an item
  because its category is unclear.

## Final self-check
Before answering, verify:
- no sum for a range (a range is one operand: its higher number)
- no repeated identical units in one quantity
- no joined volume+volume or weight+weight
- no "many" on abbreviations; "many" present on every full-word unit
- no "as needed + more as needed"
- every item name singular
- every input string appears exactly once in sources or unparsed
- there are {{TOTAL_STRINGS}} ingredient strings in total across all recipes.
- the "sources" arrays plus "unparsed" contains exactly {{TOTAL_STRINGS}} strings.
`;