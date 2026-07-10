import ExpenseManager from "./expenseManager.js";
import FrankfurterClient from "./frankfurterClient.js";
import CurrencyConversionService from "./currencyConversionService.js";

const expenseManager = new ExpenseManager();
const frankfurterClient = new FrankfurterClient();
const currencyConversionService = new CurrencyConversionService(frankfurterClient);

const today = new Date().toISOString().split("T")[0];
document.getElementById("date").max = today;

// API
let currencyList = [];
async function loadCurrencyOptionsFromApi() {
  currencyList = await frankfurterClient.getCurrencyList();
  const currency = document.getElementById("currency");
  const lastCurrency = localStorage.getItem("tripBudgetLastCurrency");
  const baseCurrency = document.getElementById("baseCurrency");
  renderLastUsedCurrencyOption(lastCurrency, currency);
  renderCurrencyOptions(currencyList, currency);
  renderCurrencyOptions(currencyList, baseCurrency);
  const savedBaseCurrency = localStorage.getItem("tripBudgetBaseCurrency");
  if (savedBaseCurrency) {
    baseCurrency.value = savedBaseCurrency;
    renderExpenses();
    renderTotalSpend();
    renderCategoryBreakdown();
  }
}
loadCurrencyOptionsFromApi();

// currency options dropdown
function renderCurrencyOptions(currencyList, currencySelect) {
  currencyList.forEach((currency) => {
    const optionText = `${currency.iso_code} - ${currency.name}`;
    const option = document.createElement("option");
    option.value = currency.iso_code;
    option.textContent = optionText;
    currencySelect.appendChild(option);
  });
}

function renderLastUsedCurrencyOption(lastCurrency, currencySelect) {
  const oldLastUsedOption = document.getElementById("lastUsedCurrencyOption");

  if (oldLastUsedOption) {
    oldLastUsedOption.remove();
  }

  if (lastCurrency) {
    const option = document.createElement("option");
    option.value = lastCurrency;
    option.textContent = `Last used: ${lastCurrency}`;
    option.id = "lastUsedCurrencyOption";
    currencySelect.insertBefore(option, currencySelect.children[1]);
  }
}

async function updateConversionPreview() {
  const amountInput = document.getElementById("amount");
  const amount = Number(amountInput.value);
  const fromCurrency = document.getElementById("currency").value;
  const baseCurrency = document.getElementById("baseCurrency").value;
  const conversionPreview = document.getElementById("conversionPreview");

  if (amount && fromCurrency && baseCurrency) {
    const convertedAmount = await frankfurterClient.convertAmount(
      amount,
      fromCurrency,
      baseCurrency,
    );
    conversionPreview.textContent = `≈ ${convertedAmount.toFixed(2)} ${baseCurrency}`;
  } else {
    conversionPreview.textContent = "";
  }
}

// currency converter
const amountInput = document.getElementById("amount");
amountInput.addEventListener("input", updateConversionPreview);

const currencySelect = document.getElementById("currency");
const baseCurrencySelect = document.getElementById("baseCurrency");
currencySelect.addEventListener("change", updateConversionPreview);
baseCurrencySelect.addEventListener("change", () => {
  localStorage.setItem("tripBudgetBaseCurrency", baseCurrencySelect.value);
  updateConversionPreview();
  renderExpenses();
  renderTotalSpend();
  renderCategoryBreakdown();
});

// Category dropdown
const PREDEFINED_CATEGORIES = [
  "Transport",
  "Accommodation",
  "Food & Drinks",
  "Activities",
  "Shopping",
];

function loadCustomCategories() {
  const saved = localStorage.getItem("tripBudgetCustomCategories");
  return saved ? JSON.parse(saved) : [];
}

function saveCustomCategories(categories) {
  localStorage.setItem("tripBudgetCustomCategories", JSON.stringify(categories));
}

function renderCategoryOptions() {
  const categorySelect = document.getElementById("category");
  const customCategories = loadCustomCategories();

  categorySelect.innerHTML = '<option value="">Choose Category</option>';

  PREDEFINED_CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  customCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = `${cat} (custom)`;
    categorySelect.appendChild(option);
  });

  const addCustomOption = document.createElement("option");
  addCustomOption.value = "__add_custom__";
  addCustomOption.textContent = "+ Add custom...";
  categorySelect.appendChild(addCustomOption);
}

renderCategoryOptions();

const categorySelect = document.getElementById("category");
const customCategoryInput = document.getElementById("customCategoryInput");
const deleteCustomCategoryBtn = document.getElementById("deleteCustomCategoryBtn");

categorySelect.addEventListener("change", () => {
  const value = categorySelect.value;

  if (value === "__add_custom__") {
    customCategoryInput.style.display = "block";
    deleteCustomCategoryBtn.style.display = "none";
    document.getElementById("customCategoryText").value = "";
    document.getElementById("customCategoryText").focus();
  } else {
    customCategoryInput.style.display = "none";
    const customCategories = loadCustomCategories();
    deleteCustomCategoryBtn.style.display = customCategories.includes(value) ? "block" : "none";
  }
});

document.getElementById("addCustomCategoryBtn").addEventListener("click", () => {
  const newCategory = document.getElementById("customCategoryText").value.trim();
  if (!newCategory) return;

  const customCategories = loadCustomCategories();
  const alreadyExists =
    PREDEFINED_CATEGORIES.includes(newCategory) || customCategories.includes(newCategory);

  if (!alreadyExists) {
    customCategories.push(newCategory);
    saveCustomCategories(customCategories);
  }

  renderCategoryOptions();
  categorySelect.value = newCategory;
  customCategoryInput.style.display = "none";
  deleteCustomCategoryBtn.style.display = "block";
});

document.getElementById("cancelCustomCategoryBtn").addEventListener("click", () => {
  customCategoryInput.style.display = "none";
  categorySelect.value = "";
});

deleteCustomCategoryBtn.addEventListener("click", () => {
  const value = categorySelect.value;
  const customCategories = loadCustomCategories().filter((cat) => cat !== value);
  saveCustomCategories(customCategories);
  renderCategoryOptions();
  deleteCustomCategoryBtn.style.display = "none";
});

// Add Expense Form
const addExpenseForm = document.getElementById("addExpenseForm");
const errorMessage = document.getElementById("errorMessage");
function getExpenseDataFromForm() {
  return {
    currency: document.getElementById("currency").value,
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value === "__add_custom__" ? "" : document.getElementById("category").value,
    date: document.getElementById("date").value,
    note: document.getElementById("note").value,
  };
}

addExpenseForm.addEventListener("submit", (event) => {
  event.preventDefault(); // preventing reload
  try {
    const expenseData = getExpenseDataFromForm();
    expenseManager.addExpense(expenseData);
    localStorage.setItem("tripBudgetLastCurrency", expenseData.currency);
    renderLastUsedCurrencyOption(expenseData.currency, currencySelect);
    addExpenseForm.reset();
    renderCategoryOptions();
    customCategoryInput.style.display = "none";
    deleteCustomCategoryBtn.style.display = "none";
    document.getElementById("conversionPreview").textContent = "";
    renderExpenses();
    renderTotalSpend();
    renderCategoryBreakdown();
    errorMessage.textContent = "";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

function renderCard(expense) {
  if (expense.id === editingExpenseId) {
    return `
        <div class="edited-expense-card">
            <select id="edit-currency-${expense.id}"></select>
            <input id="edit-amount-${expense.id}" type="number" value="${expense.amount}">
            <p id="edit-conversion-preview-${expense.id}"></p>
            <select id="edit-category-${expense.id}"></select>
            <input id="edit-date-${expense.id}" type="date" max="${today}">
            <input id="edit-note-${expense.id}" value="${expense.note}">
            <button class="confirm-edit-btn" data-id="${expense.id}">Confirm</button>
            <button class="cancel-edit-btn" data-id="${expense.id}">Cancel</button>
            <p id="edit-error-${expense.id}"></p>
        </div>`;
  }
  return `
        <div class="expense-card">
            <p>${expense.currency}</p>
            <p>${expense.amount}</p>
            <p id="converted-expense-${expense.id}"></p>
            <p>${expense.category}</p>
            <p>${expense.date}</p>
            <p>${expense.note}</p>
            <button class="delete-btn" data-id="${expense.id}">Delete</button> 
            <button class="edit-btn" data-id="${expense.id}">Edit</button> 
        </div>`;
}

function renderExpenses(expenses = expenseManager.getExpenses()) {
  const expenseList = document.getElementById("expenseList");
  expenseList.innerHTML = "";
  expenses.forEach((expense) => {
    expenseList.innerHTML += renderCard(expense);
  });
  expenses.forEach((expense) => {
    renderConvertedExpenseAmount(expense);
  });
  if (editingExpenseId !== null) {
    const editingExpense = expenses.find((e) => e.id === editingExpenseId);
    if (editingExpense) populateEditForm(editingExpense);
  }
}

function populateEditForm(expense) {
  const editCurrencySelect = document.getElementById(`edit-currency-${expense.id}`);
  const editCategorySelect = document.getElementById(`edit-category-${expense.id}`);
  const editAmountInput = document.getElementById(`edit-amount-${expense.id}`);
  const editConversionPreview = document.getElementById(`edit-conversion-preview-${expense.id}`);

  currencyList.forEach((currency) => {
    const option = document.createElement("option");
    option.value = currency.iso_code;
    option.textContent = `${currency.iso_code} - ${currency.name}`;
    editCurrencySelect.appendChild(option);
  });
  editCurrencySelect.value = expense.currency;
  document.getElementById(`edit-date-${expense.id}`).value = expense.date;

  editCategorySelect.innerHTML = '<option value="">Choose Category</option>';
  PREDEFINED_CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    editCategorySelect.appendChild(option);
  });
  loadCustomCategories().forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = `${cat} (custom)`;
    editCategorySelect.appendChild(option);
  });
  editCategorySelect.value = expense.category;

  async function updateEditConversionPreview() {
    const amount = Number(editAmountInput.value);
    const fromCurrency = editCurrencySelect.value;
    const baseCurrency = document.getElementById("baseCurrency").value;
    if (amount && fromCurrency && baseCurrency) {
      try {
        const converted = await frankfurterClient.convertAmount(amount, fromCurrency, baseCurrency);
        editConversionPreview.textContent = `≈ ${converted.toFixed(2)} ${baseCurrency}`;
      } catch {
        editConversionPreview.textContent = "";
      }
    } else {
      editConversionPreview.textContent = "";
    }
  }

  editAmountInput.addEventListener("input", updateEditConversionPreview);
  editCurrencySelect.addEventListener("change", updateEditConversionPreview);
  updateEditConversionPreview();
}

async function renderConvertedExpenseAmount(expense) {
  const baseCurrency = document.getElementById("baseCurrency").value;
  const convertedExpenseText = document.getElementById(
    `converted-expense-${expense.id}`,
  );

  if (!convertedExpenseText) return;

  if (!baseCurrency) {
    convertedExpenseText.textContent = "";
    return;
  }

  const convertedAmount = await frankfurterClient.convertAmountOnDate(
    expense.amount,
    expense.currency,
    baseCurrency,
    expense.date,
  );

  convertedExpenseText.textContent = `≈ ${convertedAmount.toFixed(2)} ${baseCurrency} (rate from ${expense.date})`;
}

// delete expense card
function deleteExpenseCard(id) {
  expenseManager.deleteExpense(id);
  renderExpenses(expenseManager.getExpenses());
  renderTotalSpend();
  renderCategoryBreakdown();
}

// edit expense card
let editingExpenseId = null;
function editExpenseCard(id) {
  editingExpenseId = id;
  renderExpenses();
}

// edit / delete expense card button
const expenseList = document.getElementById("expenseList");
function getUpdatedExpenseDataFromEditForm(id) {
  return {
    currency: document.getElementById(`edit-currency-${id}`).value,
    amount: Number(document.getElementById(`edit-amount-${id}`).value),
    category: document.getElementById(`edit-category-${id}`).value,
    date: document.getElementById(`edit-date-${id}`).value,
    note: document.getElementById(`edit-note-${id}`).value,
  };
}

function cancelEdit() {
  editingExpenseId = null;
  renderExpenses();
}

function confirmEdit(id) {
  const updatedExpense = getUpdatedExpenseDataFromEditForm(id);
  expenseManager.updateExpense(id, updatedExpense);
  editingExpenseId = null;
  renderExpenses();
  renderTotalSpend();
  renderCategoryBreakdown();
}

expenseList.addEventListener("click", (event) => {
  try {
    if (event.target.tagName === "BUTTON") {
      event.preventDefault();
    }
    if (event.target.classList.contains("delete-btn")) {
      deleteExpenseCard(Number(event.target.dataset.id));
    } else if (event.target.classList.contains("edit-btn")) {
      editExpenseCard(Number(event.target.dataset.id));
    } else if (event.target.classList.contains("cancel-edit-btn")) {
      cancelEdit();
    } else if (event.target.classList.contains("confirm-edit-btn")) {
      const id = Number(event.target.dataset.id);
      confirmEdit(id);
    }
  } catch (error) {
    const editCardErrorMessage = document.getElementById(
      `edit-error-${editingExpenseId}`,
    );
    editCardErrorMessage.textContent = error.message;
  }
});

renderExpenses();

// total spent
async function renderTotalSpend() {
  const expenses = expenseManager.getExpenses();
  const baseCurrency = document.getElementById("baseCurrency").value;
  const totalSpend = document.getElementById("totalSpend");

  if (!baseCurrency) {
    totalSpend.textContent = "Please choose a base currency";
    return;
  }

  if (expenses.length === 0) {
    totalSpend.textContent = `Total spend: 0.00 ${baseCurrency}`;
    return;
  }

  let total = 0;

  for (const expense of expenses) {
    try {
      const convertedAmount = await frankfurterClient.convertAmountOnDate(
        expense.amount,
        expense.currency,
        baseCurrency,
        expense.date,
      );
      total += convertedAmount;
    } catch {
      totalSpend.textContent = `Error converting ${expense.currency} to ${baseCurrency}`;
      return;
    }
  }

  totalSpend.textContent = `Total spend: ${total.toFixed(2)} ${baseCurrency}`;
}
renderTotalSpend();

// category breakdown
async function renderCategoryBreakdown() {
  const expenses = expenseManager.getExpenses();
  const baseCurrency = document.getElementById("baseCurrency").value;
  const categoryBreakdown = document.getElementById("categoryBreakdown");

  if (!baseCurrency || expenses.length === 0) {
    categoryBreakdown.innerHTML = "";
    return;
  }

  try {
    const summary = await currencyConversionService.calculateBudgetSummary(
      expenses,
      baseCurrency,
    );

    categoryBreakdown.innerHTML = Object.entries(summary)
      .map(
        ([category, total]) =>
          `<div class="category-card">
            <p>${category}</p>
            <p>${total.toFixed(2)} ${baseCurrency}</p>
          </div>`,
      )
      .join("");
  } catch {
    categoryBreakdown.innerHTML = "<p>Error loading category breakdown</p>";
  }
}
renderCategoryBreakdown();
