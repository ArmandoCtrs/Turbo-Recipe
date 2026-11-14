/**
 * Renders an LLM-provided quantity string containing <q /> tags into display text.
 * Never throws. Each warning is { level: "critical" | "soft", code, message }.
 * Critical warnings mean the output is wrong or unusable and should trigger a retry.
 */

// The code in this file was primarily generated through iteration with Claude.

const Q_TAG = /<q\b([^>]*?)\/?>/gi;                                   // regex 1: find tags
const ATTR = /([a-z_]+)\s*=\s*(?:'([^']*)'|"([^"]*)")/gi;             // regex 2: parse attributes
const VAGUE = /^\s*as needed(\s*\+\s*more as needed)?\s*$/i;

const critical = (code, message) => ({ level: "critical", code, message });
const soft = (code, message) => ({ level: "soft", code, message });

// ---------- safe arithmetic (no eval) ----------
function safeEval(src) {
  if (!/^[0-9+\-*/().\s]+$/.test(src)) throw new Error("illegal characters");
  const tokens = src.match(/\d*\.?\d+|[+\-*/()]/g) || [];
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function factor() {
    const t = next();
    if (t === "-") return -factor();
    if (t === "(") {
      const v = expr();
      if (next() !== ")") throw new Error("missing )");
      return v;
    }
    if (t !== undefined && /^\d|^\./.test(t)) return parseFloat(t);
    throw new Error("unexpected token");
  }
  function term() {
    let v = factor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  const result = expr();
  if (i !== tokens.length) throw new Error("trailing tokens");
  if (!Number.isFinite(result)) throw new Error("non-finite result");
  return result;
}

// ---------- number formatting ----------
const DENOMS = [2, 3, 4, 6, 8];
const TOL = 0.01;

function toFraction(x) {
  const nearest = Math.round(x);
  if (Math.abs(x - nearest) < TOL) return { whole: nearest, num: 0, den: 1 };
  const whole = Math.floor(x);
  const frac = x - whole;
  for (const den of DENOMS) {
    const num = Math.round(frac * den);
    if (num > 0 && num < den && Math.abs(frac - num / den) < TOL) {
      return { whole, num, den };
    }
  }
  return null;
}

function snap(x) {
  const f = toFraction(x);
  return f ? f.whole + f.num / f.den : Math.round(x * 100) / 100;
}

function formatNumber(x) {
  const f = toFraction(x);
  if (!f) return String(Math.round(x * 100) / 100);
  if (f.num === 0) return String(f.whole);
  return f.whole ? `${f.whole} ${f.num}/${f.den}` : `${f.num}/${f.den}`;
}

function parseAttrs(attrString) {
  const attrs = {};
  for (const m of attrString.matchAll(ATTR)) attrs[m[1].toLowerCase()] = m[2] ?? m[3];
  return attrs;
}

// ---------- main ----------
function renderQuantity(quantity, opts = {}) {
  const warnings = [];
  const raw = typeof quantity === "string" ? quantity : "";

  if (!raw.trim()) {
    return { text: "as needed", warnings: [critical("EMPTY_QUANTITY", "quantity is empty")] };
  }
  if (VAGUE.test(raw)) return { text: "as needed", warnings };

  const seenUnits = [];
  let tagCount = 0;

  let text = raw.replace(Q_TAG, (whole, attrString) => {
    tagCount++;
    const { expr, one, many } = parseAttrs(attrString);

    if (!expr) {
      warnings.push(critical("MISSING_EXPR", `tag has no expr: ${whole}`));
      return one ?? "";
    }

    let value;
    try {
      value = safeEval(expr);
    } catch (err) {
      warnings.push(critical("BAD_EXPR", `bad expression "${expr}": ${err.message}`));
      return [expr, many ?? one].filter(Boolean).join(" ");
    }

    const snapped = snap(value); // snap BEFORE the plural check
    const unit = snapped > 1 ? (many ?? one) : one;
    seenUnits.push(one ?? "");
    return [formatNumber(value), unit].filter(Boolean).join(" ");
  });

  const dupes = seenUnits.filter((u, idx) => seenUnits.indexOf(u) !== idx);
  if (dupes.length) {
    warnings.push(soft("REPEATED_UNIT", `unit repeated across tags: ${[...new Set(dupes)].join(", ")}`));
  }

  if (/<\/?q\b/i.test(text)) {
    warnings.push(critical("LEFTOVER_MARKUP", "malformed <q> markup survived rendering"));
    text = text.replace(/<\/?q\b[^>]*>/gi, "");
  }

  if (tagCount === 0) warnings.push(soft("UNTAGGED", "no <q> tag; rendered as-is"));

  text = text.replace(/\s+/g, " ").trim();
  if (opts.approximate && text !== "as needed" && !text.startsWith("~")) text = `~${text}`;

  return { text, warnings };
}

function renderItemLine(item) {
  const { text, warnings } = renderQuantity(item.quantity, { approximate: item.approximate });
  const name = item.item ? item.item[0].toUpperCase() + item.item.slice(1) : "";
  return { line: `${name}: ${text}`, warnings };
}

module.exports = { renderQuantity, renderItemLine, safeEval, snap, formatNumber };
