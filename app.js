import ExpenseManager from "./expenseManager.js";
import FrankfurterClient from "./frankfurterClient.js";

const expenseManager = new ExpenseManager();
const frankfurterClient = new FrankfurterClient();

// API
async function loadCurrencyOptionsFromApi() {
  const currencyList = await frankfurterClient.getCurrencyList();
  const currency = document.getElementById("currency");
  const lastCurrency = localStorage.getItem("tripBudgetLastCurrency");
  const baseCurrency = document.getElementById("baseCurrency");
  renderLastUsedCurrencyOption(lastCurrency, currency);
  renderCurrencyOptions(currencyList, currency);
  renderCurrencyOptions(currencyList, baseCurrency);
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
  updateConversionPreview();
  renderExpenses();
  renderTotalSpend();
});

// Add Expense Form
const addExpenseForm = document.getElementById("addExpenseForm");
const errorMessage = document.getElementById("errorMessage");
function getExpenseDataFromForm() {
  return {
    currency: document.getElementById("currency").value,
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
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
    document.getElementById("conversionPreview").textContent = "";
    renderExpenses();
    renderTotalSpend();
    errorMessage.textContent = "";
  } catch (error) {
    errorMessage.textContent = error.message;
  }
});

function renderCard(expense) {
  if (expense.id === editingExpenseId) {
    return `
        <div class="edited-expense-card">
            <input id="edit-currency-${expense.id}" value="${expense.currency}">
            <input id="edit-amount-${expense.id}" type="number" value="${expense.amount}">
            <input id="edit-category-${expense.id}" value="${expense.category}">
            <input id="edit-date-${expense.id}" type="date" value="${expense.date}">
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
}

async function renderConvertedExpenseAmount(expense) {
  const baseCurrency = document.getElementById("baseCurrency").value;
  const convertedExpenseText = document.getElementById(
    `converted-expense-${expense.id}`,
  );

  if (!baseCurrency) {
    convertedExpenseText.textContent = "";
    return;
  }

  const convertedAmount = await frankfurterClient.convertAmount(
    expense.amount,
    expense.currency,
    baseCurrency,
  );

  convertedExpenseText.textContent = `≈ ${convertedAmount.toFixed(2)} ${baseCurrency}`;
}

// delete expense card
function deleteExpenseCard(id) {
  expenseManager.deleteExpense(id);
  renderExpenses(expenseManager.getExpenses());
  renderTotalSpend();
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
}

expenseList.addEventListener("click", (event) => {
  try {
    event.preventDefault(); // preventing reload
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
      const convertedAmount = await frankfurterClient.convertAmount(
        expense.amount,
        expense.currency,
        baseCurrency,
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
