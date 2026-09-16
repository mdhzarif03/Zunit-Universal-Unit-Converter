const categorySelect = document.getElementById("category");
const valueInput = document.getElementById("value");
const fromUnitSelect = document.getElementById("from-unit");
const toUnitSelect = document.getElementById("to-unit");
const swapButton = document.getElementById("swap-button");

const resultElement = document.getElementById("result");
const resultUnitElement = document.getElementById("result-unit");
const categoryCountElement = document.getElementById("category-count");

const themeToggle = document.getElementById("theme-toggle");

/* =========================================================
STATE
========================================================= */

let unitsData = {};

/* =========================================================
HELPERS
========================================================= */

/**

* Capitalize the first letter of a string.
  */
function capitalize(text) {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**

* Format a number cleanly without unnecessary decimals.
  */
function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "—";
  }

  if (number === 0) {
    return "0";
  }

  const absolute = Math.abs(number);

  /*

* Use scientific notation for extremely large
* or extremely small values.
  */
  if (absolute >= 1e12 || (absolute > 0 && absolute < 1e-9)) {
    return number.toExponential(8).replace(/.?0+e/, "e");
  }

  /*

* Avoid floating-point noise.
  */
  const rounded =
    Math.abs(number) < 1
      ? Number(number.toPrecision(12))
      : Number(number.toPrecision(12));

  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: 10,
    useGrouping: false,
  });
}

/**

* Create an option element.
  */
function createOption(value, label) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = label;

  return option;
}

/* =========================================================
LOAD UNITS
========================================================= */

async function loadUnits() {
  try {
    const response = await fetch("/units");

    if (!response.ok) {
      throw new Error("Failed to load units.");
    }

    unitsData = await response.json();

    populateCategories();
  } catch (error) {
    console.error("Zunit:", error);

    resultElement.textContent = "Unable to load";
    resultUnitElement.textContent = "Please refresh the page";
  }
}

/* =========================================================
CATEGORIES
========================================================= */

function populateCategories() {
  categorySelect.innerHTML = "";

  const categories = Object.keys(unitsData);

  categoryCountElement.textContent = categories.length;

  categories.forEach((category) => {
    const option = createOption(category, capitalize(category));

    categorySelect.appendChild(option);
  });

  if (categories.length > 0) {
    categorySelect.value = categories[0];

    populateUnits(categories[0]);
  }
}

/* =========================================================
UNITS
========================================================= */

function populateUnits(category) {
  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";

  const units = unitsData[category];

  if (!units) {
    return;
  }

  /*

* /units may return either:
*
* ["meter", "kilometer", ...]
*
* or
*
* {
* "meter": "Meter",
* "kilometer": "Kilometer"
* }
  */

  if (Array.isArray(units)) {
    units.forEach((unit) => {
      const label = capitalize(String(unit).replace(/_/g, " "));

      fromUnitSelect.appendChild(createOption(unit, label));

      toUnitSelect.appendChild(createOption(unit, label));
    });
  } else {
    Object.entries(units).forEach(([unit, label]) => {
      fromUnitSelect.appendChild(createOption(unit, label));

      toUnitSelect.appendChild(createOption(unit, label));
    });
  }

  /*

* Default to the first unit and second unit
* where possible.
  */

  if (fromUnitSelect.options.length > 0) {
    fromUnitSelect.selectedIndex = 0;
  }

  if (toUnitSelect.options.length > 1) {
    toUnitSelect.selectedIndex = 1;
  } else if (toUnitSelect.options.length > 0) {
    toUnitSelect.selectedIndex = 0;
  }

  updateResultUnit();

  convertValue();
}

/* =========================================================
CONVERSION
========================================================= */

async function convertValue() {
  const value = valueInput.value.trim();

  const category = categorySelect.value;
  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;

  if (value === "" || !category || !fromUnit || !toUnit) {
    resultElement.textContent = "—";

    updateResultUnit();

    return;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    resultElement.textContent = "—";

    updateResultUnit();

    return;
  }

  try {
    const response = await fetch("/convert", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        value: numericValue,
        category: category,
        from_unit: fromUnit,
        to_unit: toUnit,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Conversion failed.");
    }

    resultElement.style.opacity = "0.45";

    requestAnimationFrame(() => {
      resultElement.textContent = formatNumber(Number(data.result));

      resultElement.style.opacity = "1";
    });

    updateResultUnit();
  } catch (error) {
    console.error("Zunit:", error);

    resultElement.textContent = "Error";

    updateResultUnit();
  }
}

/* =========================================================
RESULT UNIT
========================================================= */

function updateResultUnit() {
  if (!toUnitSelect.value) {
    resultUnitElement.textContent = "";
    return;
  }

  const selectedOption = toUnitSelect.options[toUnitSelect.selectedIndex];

  if (selectedOption) {
    resultUnitElement.textContent = selectedOption.textContent;
  }
}

/* =========================================================
CATEGORY CHANGE
========================================================= */

categorySelect.addEventListener("change", () => {
  const category = categorySelect.value;

  populateUnits(category);
});

/* =========================================================
VALUE CHANGE
========================================================= */

valueInput.addEventListener("input", convertValue);

/* =========================================================
UNIT CHANGE
========================================================= */

fromUnitSelect.addEventListener("change", convertValue);

toUnitSelect.addEventListener("change", () => {
  updateResultUnit();

  convertValue();
});

/* =========================================================
SWAP UNITS
========================================================= */

swapButton.addEventListener("click", () => {
  const fromValue = fromUnitSelect.value;

  const toValue = toUnitSelect.value;

  fromUnitSelect.value = toValue;
  toUnitSelect.value = fromValue;

  /*
   * Trigger the small visual rotation.
   */

  swapButton.classList.remove("active");

  requestAnimationFrame(() => {
    swapButton.classList.add("active");
  });

  updateResultUnit();

  convertValue();
});

/* =========================================================
KEYBOARD SUPPORT
========================================================= */

document.addEventListener("keydown", (event) => {
  /*
   * Ctrl/Cmd + Shift + S
   * swaps the units.
   */

  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === "s"
  ) {
    event.preventDefault();

    swapButton.click();
  }
});

/* =========================================================
THEME SWITCHER
========================================================= */

function setTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);

  localStorage.setItem("zunit-theme", theme);

  /*

* Update browser UI theme color.
  */

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#1b1b1b" : "#f4f3ef");
  }

  /*

* Update accessibility information.
  */

  if (themeToggle) {
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    themeToggle.setAttribute("aria-label", label);

    themeToggle.setAttribute("title", label);
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("zunit-theme");

  /*

* If the user has previously selected a theme,
* respect that choice.
  */

  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);

    return;
  }

  /*

* Otherwise follow the operating system preference.
  */

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(prefersDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");

    setTheme(isDark ? "light" : "dark");
  });
}

/* =========================================================
INITIALIZE
========================================================= */

initializeTheme();
loadUnits();
