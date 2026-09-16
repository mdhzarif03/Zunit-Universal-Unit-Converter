const categorySelect = document.getElementById("category");
const valueInput = document.getElementById("value");

const fromUnitSelect = document.getElementById("from-unit");
const toUnitSelect = document.getElementById("to-unit");

const swapButton = document.getElementById("swap-button");

const resultElement = document.getElementById("result");
const resultUnitElement = document.getElementById("result-unit");

const categoryCount = document.getElementById("category-count");

let units = {};

/*
|--------------------------------------------------------------------------
| Initialisation
|--------------------------------------------------------------------------
*/

async function initialise() {
  try {
    const response = await fetch("/units");

    if (!response.ok) {
      throw new Error("Unable to load units.");
    }

    units = await response.json();

    populateCategories();

    categoryCount.textContent = Object.keys(units).length;

    updateUnits();
  } catch (error) {
    console.error(error);

    resultElement.textContent = "—";
    resultUnitElement.textContent = "Unable to load converter";
  }
}

/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

function populateCategories() {
  categorySelect.innerHTML = "";

  Object.keys(units).forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categorySelect.appendChild(option);
  });
}

/*
|--------------------------------------------------------------------------
| Units
|--------------------------------------------------------------------------
*/

function updateUnits() {
  const category = categorySelect.value;

  const categoryUnits = units[category] || [];

  fromUnitSelect.innerHTML = "";
  toUnitSelect.innerHTML = "";

  categoryUnits.forEach((unit, index) => {
    const fromOption = document.createElement("option");
    fromOption.value = unit;
    fromOption.textContent = unit;

    const toOption = document.createElement("option");
    toOption.value = unit;
    toOption.textContent = unit;

    fromUnitSelect.appendChild(fromOption);
    toUnitSelect.appendChild(toOption);

    if (index === 1) {
      toOption.selected = true;
    }
  });

  convertValue();
}

/*
|--------------------------------------------------------------------------
| Conversion
|--------------------------------------------------------------------------
*/

async function convertValue() {
  const value = valueInput.value;

  if (value === "" || Number.isNaN(Number(value))) {
    resultElement.textContent = "—";
    resultUnitElement.textContent = "";
    return;
  }

  const payload = {
    value: Number(value),
    category: categorySelect.value,
    from_unit: fromUnitSelect.value,
    to_unit: toUnitSelect.value,
  };

  try {
    const response = await fetch("/convert", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Conversion failed.");
    }

    resultElement.style.opacity = "0";

    requestAnimationFrame(() => {
      resultElement.textContent = formatNumber(data.result);

      resultUnitElement.textContent = toUnitSelect.value;

      resultElement.style.opacity = "1";
    });
  } catch (error) {
    console.error(error);

    resultElement.textContent = "—";
    resultUnitElement.textContent = "Conversion error";
  }
}

/*
|--------------------------------------------------------------------------
| Number formatting
|--------------------------------------------------------------------------
*/

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "∞";
  }

  if (number === 0) {
    return "0";
  }

  const absolute = Math.abs(number);

  if (absolute >= 1e12 || absolute < 1e-9) {
    return number.toExponential(8).replace(/\.?0+e/, "e");
  }

  if (Number.isInteger(number)) {
    return number.toLocaleString("en-US");
  }

  return Number(number.toPrecision(12)).toLocaleString("en-US", {
    maximumFractionDigits: 10,
  });
}

/*
|--------------------------------------------------------------------------
| Swap
|--------------------------------------------------------------------------
*/

function swapUnits() {
  const currentFrom = fromUnitSelect.value;
  const currentTo = toUnitSelect.value;

  fromUnitSelect.value = currentTo;
  toUnitSelect.value = currentFrom;

  swapButton.classList.remove("active");

  void swapButton.offsetWidth;

  swapButton.classList.add("active");

  convertValue();
}

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

categorySelect.addEventListener("change", updateUnits);

valueInput.addEventListener("input", convertValue);

fromUnitSelect.addEventListener("change", convertValue);

toUnitSelect.addEventListener("change", convertValue);

swapButton.addEventListener("click", swapUnits);

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

initialise();
