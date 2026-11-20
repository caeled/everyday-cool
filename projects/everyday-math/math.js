"use strict";
/* Everyday Math — pure rules. No DOM: test.cjs checks this file directly.
   Every bench on the page is arithmetic over the functions below, so the
   page and the tests can never drift apart. The room's one rule: every
   trick is shown with its reason, and every formula with a worked
   example. Numbers are stated the way they are actually used — money to
   the cent, logs to four decimals, and floating point's last-digit lie
   named where it lives (the calculator). */

/* ---- The nines table: two columns write the whole table ----
   Write 0 to 9 down one column and 9 to 0 up the other, and read across:
   09, 18, 27, ... 90 — the nines table, with every digit pair summing
   to 9. It works because 9 = 10 - 1: each step up the table adds a ten
   and takes one away, so the tens digit climbs by one while the ones
   digit falls by one, and the sum never changes. */
function ninesTable() {
 const rows = [];
 for (let m = 1; m <= 10; m++) {
  const tens = m - 1, ones = 10 - m;
  rows.push({ m, tens, ones, product: tens * 10 + ones, digitSum: tens + ones });
 }
 return { rows, steps: [
  "Write 0 to 9 down one column — those become the tens digits.",
  "Write 9 to 0 up the other column — those become the ones digits.",
  "Read across: 09, 18, 27, 36, 45, 54, 63, 72, 81, 90. The whole nines table, written without a single multiplication.",
  "Every pair of digits adds to 9 — and that is the reason why: 9 is 10 − 1, so each step up the table adds a ten and takes one away. The tens digit climbs by one, the ones digit falls by one, and the sum never changes."
 ] };
}

/* ---- Times eleven: split, add, carry ----
   For a two-digit number ab: write a, then a + b, then b. If the middle
   sum reaches ten, carry the one into the first digit. It works because
   11 = 10 + 1: n × 11 is n shifted one place plus n itself, and the
   middle digit is where the two copies overlap. */
function timesEleven(n) {
 if (!Number.isInteger(n) || n < 0 || n > 99) return { ok: false };
 const a = Math.floor(n / 10), b = n % 10, mid = a + b;
 const carry = mid >= 10 ? 1 : 0;
 const digits = carry ? [a + 1, mid - 10, b] : (n < 10 ? [n, n] : [a, mid, b]);
 const result = digits.reduce((s, d) => s * 10 + d, 0);
 const steps = n < 10
  ? ["A one-digit number just doubles its digit: " + n + " × 11 = " + result + "."]
  : ["Split " + n + " into its digits: " + a + " and " + b + ".",
     "Add them: " + a + " + " + b + " = " + mid + (carry ? " — ten or more, so carry the 1 into the first digit." : "."),
     "Read the answer off: " + digits.join(", ") + " → " + n + " × 11 = " + fmt(result) + ".",
     "Why it works: 11 is 10 + 1, so n × 11 is n shifted one place, plus n. The middle digit is where the two copies overlap and add."];
 return { ok: true, n, result, digits, steps };
}

/* ---- Squaring a number that ends in 5 ----
   For n5 (35, 65, 115...): take the head h (everything before the 5),
   multiply h × (h + 1), and tack 25 on the end. 35² : 3 × 4 = 12, so
   1225. It works because (10h + 5)² = 100h(h + 1) + 25 — the 25 is the
   5 squared, and the head's part is always a whole number of hundreds. */
function squareFive(n) {
 if (!Number.isInteger(n) || n < 5 || n % 10 !== 5) return { ok: false };
 const head = (n - 5) / 10, front = head * (head + 1), result = front * 100 + 25;
 return { ok: true, n, head, front, result, steps: [
  "Split " + n + " into its head and its 5: the head is " + head + ".",
  "Multiply the head by the next number up: " + head + " × " + (head + 1) + " = " + front + ".",
  "Tack 25 on the end — the 5, squared: " + n + "² = " + fmt(result) + ".",
  "Why it works: (10h + 5)² = 100 × h × (h + 1) + 25. The head's part is always whole hundreds, so the 25 sits untouched at the end."
 ] };
}

/* ---- Digit sums and casting out nines ----
   Add a number's digits; repeat and you reach its digital root. A
   number and its root differ by a multiple of 9, so roots check
   arithmetic: the root of a product must equal the root of the product
   of the roots. A mismatch proves an answer wrong. A match does not
   prove it right — an answer off by exactly 9 slips through. */
function digitSum(n) {
 return String(Math.abs(Math.round(n))).split("").reduce((s, c) => s + Number(c), 0);
}
function digitalRoot(n) {
 n = Math.abs(Math.round(n));
 if (n === 0) return 0;
 return 1 + ((n - 1) % 9);
}
function castingOutNines(a, b, claimed) {
 if (![a, b, claimed].every((v) => Number.isInteger(v) && v >= 0)) return { ok: false };
 const product = a * b;
 const left = digitalRoot(digitalRoot(a) * digitalRoot(b));
 const right = digitalRoot(claimed);
 const match = left === right;
 return { ok: true, a, b, claimed, product, left, right, match,
  correct: claimed === product, steps: [
   "Root of " + a + " is " + digitalRoot(a) + "; root of " + b + " is " + digitalRoot(b) + ". Multiply the roots: " + digitalRoot(a) + " × " + digitalRoot(b) + " = " + (digitalRoot(a) * digitalRoot(b)) + ", whose root is " + left + ".",
   "Root of the claimed answer " + fmt(claimed) + " is " + right + ".",
   match
    ? "The roots agree — the claim passes the nines check." + (claimed === product ? " And it is in fact right: " + a + " × " + b + " = " + fmt(product) + "." : " But passing is not proof: the true product is " + fmt(product) + ", and this claim is off by " + fmt(Math.abs(claimed - product)) + " — a multiple of 9 slips straight through the check.")
    : "The roots disagree — the claim is certainly wrong. The true product is " + a + " × " + b + " = " + fmt(product) + "."
  ] };
}

/* ---- Divisibility: the rules, each with its reason showing ----
   2, 5, 10 read the last digit because 10 is 2 × 5. 4 reads the last
   two digits because 100 is 4 × 25. 3 and 9 read the digit sum because
   10 is one more than 9 — every power of ten is a multiple of 9 plus 1,
   so a number and its digit sum leave the same remainder on 9 (and 3). */
function divisibility(n) {
 if (!Number.isInteger(n) || n === 0) return { ok: false };
 const a = Math.abs(n), last = a % 10, lastTwo = a % 100, ds = digitSum(a);
 const alt = String(a).split("").reverse().reduce((s, c, i) => s + (i % 2 === 0 ? Number(c) : -Number(c)), 0);
 const by = (d) => a % d === 0;
 const results = [
  { d: 2, yes: by(2), why: "it ends in " + last + (last % 2 === 0 ? ", an even digit." : ", an odd digit.") },
  { d: 3, yes: by(3), why: "its digits add to " + ds + ", and " + ds + (ds % 3 === 0 ? " divides by 3." : " does not divide by 3.") },
  { d: 4, yes: by(4), why: "its last two digits make " + lastTwo + ", and " + lastTwo + (lastTwo % 4 === 0 ? " divides by 4." : " does not divide by 4.") },
  { d: 5, yes: by(5), why: "it ends in " + last + (last === 0 || last === 5 ? ", a 0 or a 5." : ", not a 0 or a 5.") },
  { d: 6, yes: by(2) && by(3), why: "6 needs both 2 and 3: the 2-rule " + (by(2) ? "passes" : "fails") + " and the 3-rule " + (by(3) ? "passes" : "fails") + "." },
  { d: 9, yes: by(9), why: "its digits add to " + ds + ", and " + ds + (ds % 9 === 0 ? " divides by 9." : " does not divide by 9.") },
  { d: 10, yes: by(10), why: "it ends in " + last + (last === 0 ? ", a 0." : ", not a 0.") },
  { d: 11, yes: by(11), why: "its alternating digit sum (from the right: add, subtract, add...) is " + alt + ", and " + Math.abs(alt) + (alt % 11 === 0 ? " divides by 11." : " does not divide by 11.") }
 ];
 return { ok: true, n: a, results };
}

/* ---- Fractions: the kitchen and workshop arithmetic ----
   Adding fractions is finding a shared measuring cup: rewrite both
   over a common denominator (the least one that fits both), add the
   tops, then reduce. Scaling a recipe is one multiplication. */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function fracReduce(num, den) {
 if (!Number.isInteger(num) || !Number.isInteger(den) || den === 0) return { ok: false };
 const g = gcd(num, den);
 return { ok: true, num: num / g, den: den / g };
}
function fracAdd(n1, d1, n2, d2) {
 if (![n1, d1, n2, d2].every(Number.isInteger) || d1 <= 0 || d2 <= 0) return { ok: false };
 const lcm = d1 * d2 / gcd(d1, d2);
 const a = n1 * (lcm / d1), b = n2 * (lcm / d2), sum = a + b;
 const r = fracReduce(sum, lcm);
 const steps = [
  "Find a denominator both cups share: the least common denominator of " + d1 + " and " + d2 + " is " + lcm + ".",
  "Rewrite each fraction over it: " + n1 + "/" + d1 + " = " + a + "/" + lcm + ", and " + n2 + "/" + d2 + " = " + b + "/" + lcm + ".",
  "Add the tops, keep the bottom: " + a + "/" + lcm + " + " + b + "/" + lcm + " = " + sum + "/" + lcm + "."
 ];
 if (r.num !== sum || r.den !== lcm) steps.push("Reduce: divide top and bottom by " + gcd(sum, lcm) + " → " + r.num + "/" + r.den + ".");
 if (r.den !== 1 && r.num > r.den) steps.push("As a mixed number: " + Math.floor(r.num / r.den) + " " + (r.num % r.den) + "/" + r.den + ".");
 if (r.den === 1) steps.push("That is a whole number: " + r.num + ".");
 return { ok: true, num: r.num, den: r.den, decimal: r.num / r.den, steps };
}
function fracScale(n, d, kn, kd) {
 if (![n, d, kn, kd].every(Number.isInteger) || d <= 0 || kd <= 0 || kn < 0) return { ok: false };
 const rawN = n * kn, rawD = d * kd, r = fracReduce(rawN, rawD);
 const steps = [
  "Multiply the tops and the bottoms: " + n + "/" + d + " × " + kn + "/" + kd + " = " + rawN + "/" + rawD + "."
 ];
 if (r.num !== rawN || r.den !== rawD) steps.push("Reduce: divide top and bottom by " + gcd(rawN, rawD) + " → " + r.num + "/" + r.den + ".");
 if (r.den !== 1 && r.num > r.den) steps.push("As a mixed number: " + Math.floor(r.num / r.den) + " " + (r.num % r.den) + "/" + r.den + " — the amount you actually measure out.");
 if (r.den === 1) steps.push("That comes out whole: " + r.num + ".");
 return { ok: true, num: r.num, den: r.den, decimal: r.num / r.den, steps };
}

/* ---- Percents: tips, discounts, interest ----
   A percent is a fraction wearing a uniform denominator of 100:
   p% of X is X × p ÷ 100. Everything on this bench is that one line. */
function percentOf(pct, base) {
 if (!isNum(pct) || !isNum(base)) return { ok: false };
 const result = base * pct / 100;
 return { ok: true, pct, base, result, steps: [
  fmt(pct) + "% of " + fmt(base) + " = " + fmt(base) + " × " + fmt(pct) + " ÷ 100 = " + fmt(result) + "."
 ] };
}
function tipAndTotal(bill, pct) {
 if (!isPos(bill) || !isNum(pct) || pct < 0) return { ok: false };
 const tip = bill * pct / 100;
 return { ok: true, bill, pct, tip, total: bill + tip, steps: [
  "The tip: " + fmtMoney(bill) + " × " + fmt(pct) + "% = " + fmtMoney(bill) + " × " + fmt(pct) + " ÷ 100 = " + fmtMoney(tip) + ".",
  "The total: " + fmtMoney(bill) + " + " + fmtMoney(tip) + " = " + fmtMoney(bill + tip) + ".",
  "In your head: 10% is a tenth (" + fmtMoney(bill / 10) + " here) — double it for 20%, halve it for 5%, and add pieces to land anywhere."
 ] };
}
function discountPrice(price, pct) {
 if (!isPos(price) || !isNum(pct) || pct < 0 || pct > 100) return { ok: false };
 const save = price * pct / 100;
 return { ok: true, price, pct, save, pay: price - save, steps: [
  "The discount: " + fmtMoney(price) + " × " + fmt(pct) + "% = " + fmtMoney(save) + " off.",
  "You pay: " + fmtMoney(price) + " − " + fmtMoney(save) + " = " + fmtMoney(price - save) + ".",
  "The other way to see it: " + fmt(pct) + "% off means paying " + fmt(100 - pct) + "% — " + fmtMoney(price) + " × " + fmt(100 - pct) + " ÷ 100 lands on the same till total."
 ] };
}
function simpleInterest(principal, ratePct, years) {
 if (!isPos(principal) || !isNum(ratePct) || ratePct < 0 || !isPos(years)) return { ok: false };
 const interest = principal * ratePct / 100 * years;
 return { ok: true, principal, ratePct, years, interest, total: principal + interest, steps: [
  "I = P × r × t = " + fmtMoney(principal) + " × " + fmt(ratePct) + "% × " + fmt(years) + " years.",
  "One year earns " + fmtMoney(principal * ratePct / 100) + "; over " + fmt(years) + " years that is " + fmtMoney(interest) + " of interest.",
  "The account ends at " + fmtMoney(principal) + " + " + fmtMoney(interest) + " = " + fmtMoney(principal + interest) + ". Simple interest pays on the original principal only — compound interest, which pays on the interest too, is the stronger (and sneakier) machine."
 ] };
}

/* ---- The formula shelf's working benches ---- */
function pythagoras(a, b) {
 if (!isPos(a) || !isPos(b)) return { ok: false };
 const c = Math.sqrt(a * a + b * b);
 return { ok: true, mode: "hypotenuse", a, b, result: c, steps: [
  "Square the two legs: " + fmt(a) + "² = " + fmt(a * a) + " and " + fmt(b) + "² = " + fmt(b * b) + ".",
  "Add them: " + fmt(a * a) + " + " + fmt(b * b) + " = " + fmt(a * a + b * b) + ". That sum is the long side, squared.",
  "Take the square root: √" + fmt(a * a + b * b) + " = " + fmt(c) + ". The long side is " + fmt(c) + "."
 ] };
}
function pythagorasLeg(c, a) {
 if (!isPos(c) || !isPos(a) || !(c > a)) return { ok: false };
 const b = Math.sqrt(c * c - a * a);
 return { ok: true, mode: "leg", c, a, result: b, steps: [
  "Square the long side and the known leg: " + fmt(c) + "² = " + fmt(c * c) + " and " + fmt(a) + "² = " + fmt(a * a) + ".",
  "Subtract — finding a leg runs the theorem backwards: " + fmt(c * c) + " − " + fmt(a * a) + " = " + fmt(c * c - a * a) + ". That is the missing leg, squared.",
  "Take the square root: √" + fmt(c * c - a * a) + " = " + fmt(b) + ". The missing leg is " + fmt(b) + "."
 ] };
}
function average(nums) {
 if (!Array.isArray(nums) || nums.length === 0 || !nums.every(isNum)) return { ok: false };
 const sum = nums.reduce((s, v) => s + v, 0);
 return { ok: true, nums, sum, count: nums.length, result: sum / nums.length, steps: [
  "Add them all: " + nums.map(fmt).join(" + ") + " = " + fmt(sum) + ".",
  "Share the total evenly among the " + nums.length + ": " + fmt(sum) + " ÷ " + nums.length + " = " + fmt(sum / nums.length) + "."
 ] };
}

/* ---- Huge and tiny: scientific notation ----
   Writing a number as a digit part (1 up to 10) times a power of ten.
   The exponent is just the count of hops the decimal point makes. */
const AVOGADRO = 6.022e23;
function toScientific(x) {
 if (!isNum(x) || x === 0) return { ok: false };
 const exp = Math.floor(Math.log10(Math.abs(x)));
 const mant = x / Math.pow(10, exp);
 const mantShown = Math.round(mant * 10000) / 10000;
 const dir = exp > 0 ? "left" : exp < 0 ? "right" : "nowhere";
 return { ok: true, x, mantissa: mantShown, exponent: exp, steps: [
  exp === 0
   ? "The number already sits between 1 and 10, so the point hops nowhere: the exponent is 0."
   : "Slide the decimal point " + Math.abs(exp) + " place" + (Math.abs(exp) === 1 ? "" : "s") + " to the " + dir + ", until one digit stands in front of it: " + fmt(x) + " becomes " + mantShown + ".",
  "Count the hops and keep the sign: " + fmt(x) + " = " + mantShown + " × 10" + supInt(exp) + "."
 ] };
}
function fromScientific(mantissa, exponent) {
 if (!isNum(mantissa) || !Number.isInteger(exponent)) return { ok: false };
 const value = mantissa * Math.pow(10, exponent);
 return { ok: true, mantissa, exponent, value, steps: [
  "Start with the digit part: " + mantissa + ".",
  exponent === 0 ? "The exponent is 0, so the point stays put: the number is " + mantissa + "."
   : "Slide the point " + Math.abs(exponent) + " place" + (Math.abs(exponent) === 1 ? "" : "s") + " to the " + (exponent > 0 ? "right (the number grows)" : "left (the number shrinks)") + ", filling with zeros: " + mantissa + " × 10" + supInt(exponent) + " = " + calcFormat(value) + "."
 ] };
}
function supInt(n) {
 const sup = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
 return String(n).split("").map((c) => sup[c]).join("");
}

/* ---- The log tables: tenths for the pocket, hundredths for print ----
   A common logarithm splits into a characteristic (the number's size —
   its power of ten) and a mantissa (from its digits alone). The tenths
   table is the pocket one, shared with Everyday Engineering's log
   bench. The hundredths table is the full one the printable sheet
   carries: 1.00 to 9.99 in steps of 0.01, plus proportional parts for
   one digit more. Both tables are rounded to four decimals, exactly as
   printed tables were, and both lookups interpolate linearly. */
const LOG_TABLE = [];
for (let i = 0; i <= 90; i++) LOG_TABLE.push(Math.round(Math.log10(1 + i / 10) * 10000) / 10000);
const LOG_TABLE_FINE = [];
for (let i = 0; i <= 900; i++) LOG_TABLE_FINE.push(Math.round(Math.log10(1 + i / 100) * 10000) / 10000);
function splitLog(x) {
 let m = x, characteristic = 0;
 while (m >= 10) { m /= 10; characteristic++; }
 while (m < 1) { m *= 10; characteristic--; }
 return { m, characteristic };
}
function logSheet(x) {
 if (!isPos(x)) return { ok: false };
 const { m, characteristic } = splitLog(x);
 const pos = (m - 1) * 100, i = Math.min(899, Math.floor(pos)), frac = pos - i;
 const lo = LOG_TABLE_FINE[i], hi = LOG_TABLE_FINE[i + 1];
 const at = 1 + i / 100, next = 1 + (i + 1) / 100;
 const mantissa = lo + frac * (hi - lo);
 const f4 = (v) => v.toFixed(4);
 const steps = [
  "Split the number into its size and its digits: " + fmt(x) + " = " + fmt(m) + " × 10" + supInt(characteristic) + ", so the characteristic is " + characteristic + " and the digits are " + fmt(m) + "."
 ];
 if (frac < 0.001) {
  steps.push("The full table gives the digits " + at.toFixed(2) + " directly: mantissa ." + f4(lo).slice(2) + ".");
 } else {
  steps.push("The full table brackets the digits: " + at.toFixed(2) + " → ." + f4(lo).slice(2) + " and " + next.toFixed(2) + " → ." + f4(hi).slice(2) + ", a difference of ." + f4(hi - lo).slice(2) + ".");
  steps.push("Proportional parts: the extra digit sits " + Math.round(frac * 10) + "/10 of the way across the step, so add " + Math.round(frac * 10) + "/10 × ." + f4(hi - lo).slice(2) + " ≈ ." + f4(frac * (hi - lo)).slice(2) + " — the mantissa is ." + f4(mantissa).slice(2) + ".");
 }
 steps.push("log₁₀(" + fmt(x) + ") = characteristic + mantissa = " + characteristic + " + ." + f4(mantissa).slice(2) + " = " + f4(characteristic + mantissa) + ".");
 return { ok: true, x, characteristic, digits: m, mantissa, result: characteristic + mantissa, steps };
}

/* ---- The times table, to 16 x 16, for the printable sheet ---- */
function timesTable(size) {
 if (!Number.isInteger(size) || size < 1 || size > 99) return { ok: false };
 const grid = [];
 for (let r = 1; r <= size; r++) { const row = []; for (let c = 1; c <= size; c++) row.push(r * c); grid.push(row); }
 return { ok: true, size, grid };
}

/* ---- The calculator's arithmetic ----
   Plain functions under the buttons, so the tests can press them
   without a page. Trig speaks degrees until told otherwise, the way
   school and workshop calculators do. The display rounds to twelve
   significant digits — which is why the machine can look at 0.1 + 0.2
   and say 0.3 while the honest answer, one digit deeper, is
   0.30000000000000004. The Help names that lie rather than hiding it. */
function calcApply(op, a, b) {
 if (!isNum(a) || !isNum(b)) return { ok: false };
 switch (op) {
  case "+": return { ok: true, result: a + b };
  case "-": return { ok: true, result: a - b };
  case "*": return { ok: true, result: a * b };
  case "/": return b === 0 ? { ok: false } : { ok: true, result: a / b };
  case "pow": return { ok: true, result: Math.pow(a, b) };
  default: return { ok: false };
 }
}
function calcFunc(fn, x, mode) {
 if (!isNum(x)) return { ok: false };
 const rad = mode === "rad";
 const toRad = (v) => rad ? v : v * Math.PI / 180;
 switch (fn) {
  case "log10": return x > 0 ? { ok: true, result: Math.log10(x) } : { ok: false };
  case "ln": return x > 0 ? { ok: true, result: Math.log(x) } : { ok: false };
  case "sqrt": return x >= 0 ? { ok: true, result: Math.sqrt(x) } : { ok: false };
  case "square": return { ok: true, result: x * x };
  case "inv": return x !== 0 ? { ok: true, result: 1 / x } : { ok: false };
  case "exp10": return { ok: true, result: Math.pow(10, x) };
  case "sin": return { ok: true, result: Math.sin(toRad(x)) };
  case "cos": return { ok: true, result: Math.cos(toRad(x)) };
  case "tan": {
   if (!rad && ((x % 180) + 180) % 180 === 90) return { ok: false };
   return { ok: true, result: Math.tan(toRad(x)) };
  }
  default: return { ok: false };
 }
}
function calcFormat(x) {
 if (typeof x !== "number" || !isFinite(x)) return "Error";
 if (x === 0) return "0";
 const ax = Math.abs(x);
 if (ax >= 1e12 || ax < 1e-9) {
  return x.toExponential(9).replace(/(\.\d*?)0+e/, "$1e").replace(/\.e/, "e");
 }
 return String(parseFloat(x.toPrecision(12)));
}

/* ---- Small helpers ---- */
function isNum(x) { return typeof x === "number" && isFinite(x); }
function isPos(x) { return isNum(x) && x > 0; }
function fmt(n) {
 if (typeof n !== "number" || !isFinite(n)) return "—";
 if (n !== 0 && Math.abs(n) < 0.001) { // tiny numbers are written out in full: 0.0000000001, never rounded to 0
  let s = n.toPrecision(10);
  if (s.includes("e")) {
   const neg = s.startsWith("-"), parts = s.split("e"), exp = parseInt(parts[1], 10);
   const digits = parts[0].replace("-", "").replace(".", "");
   s = (neg ? "-" : "") + "0." + "0".repeat(-exp - 1) + digits;
  }
  return s.replace(/0+$/, "").replace(/\.$/, ".0");
 }
 const rounded = Math.abs(n) >= 100 ? Math.round(n * 10) / 10 : Math.round(n * 1000) / 1000;
 return Number(rounded).toLocaleString("en-US", { maximumFractionDigits: 3 });
}
function fmtMoney(n) {
 if (typeof n !== "number" || !isFinite(n)) return "—";
 return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const api = { ninesTable, timesEleven, squareFive, digitSum, digitalRoot, castingOutNines, divisibility,
 gcd, fracReduce, fracAdd, fracScale, percentOf, tipAndTotal, discountPrice, simpleInterest,
 pythagoras, pythagorasLeg, average, AVOGADRO, toScientific, fromScientific, supInt,
 LOG_TABLE, LOG_TABLE_FINE, logSheet, timesTable, calcApply, calcFunc, calcFormat, fmt, fmtMoney };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") Object.assign(window, api);
