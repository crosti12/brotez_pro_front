export function formatDigits(str) {
  let digits = (str ?? "").toString().replace(/\D/g, "");
  if (!digits) return "0,000";
  if (digits.length === 3) digits = "0" + digits;
  if (digits.startsWith("000") && digits.length === 3) digits = digits.slice(1);
  if (digits.startsWith("0000") && digits.length > 3) digits = digits.slice(1);
  if (digits.length === 5 && digits.startsWith("0")) digits = digits.slice(1);

  let main = digits.slice(0, 1);
  if (digits.length > 4) main = digits.slice(0, 2);

  let lastTwo = digits.slice(-3);
  main = main.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return main + "," + lastTwo;
}

export function parseNumber(str) {
  return parseFloat((str || "").replace(/\./g, "").replace(",", "."));
}

export function sumCommaStrings(val1, val2) {
  const num1 = parseFloat(val1.replace(",", "."));
  const num2 = parseFloat(val2.replace(",", "."));

  const sum = num1 + num2;

  return sum.toFixed(3).replace(".", ",");
}

export function addDots(num, decimals = 2) {
  if (typeof num === "number" && !isNaN(num)) {
    return new Intl.NumberFormat("de-DE").format(decimals ? num.toFixed(decimals) : num);
  }

  if (typeof num === "string") {
    const cleaned = num.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);

    if (!isNaN(parsed)) {
      return new Intl.NumberFormat("de-DE").format(parsed);
    }
  }

  return String(num ?? "");
}
export function calculate(operation, ...args) {
  const numbers = args.map((arg) => {
    try {
      if (typeof arg === "string") {
        return parseFloat(arg.replace(",", "."));
      }
      return parseFloat(arg);
    } catch (error) {
      console.error("error converting values in calculate:", error);
      return 0;
    }
  });

  switch (operation) {
    case "add":
      return numbers.reduce((acc, n) => acc + n, 0);
    case "subtract":
      return numbers.reduce((acc, n) => acc - n);
    case "multiply":
      return numbers.reduce((acc, n) => acc * n, 1);
    case "divide":
      return numbers.reduce((acc, n) => acc / n);
    default:
      console.error("Unsupported operation");
      return 0;
  }
}
