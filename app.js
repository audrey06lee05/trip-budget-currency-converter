import ExpenseManager from "./expenseManager.js";

const expenseManager = new ExpenseManager();

// Add Expense Form
const addExpenseForm = document.getElementById("addExpenseForm");
const errorMessage = document.getElementById("errorMessage");
addExpenseForm.addEventListener("submit", (event) => {
  event.preventDefault(); // preventing reload
  try {
    // expenseData object
    const currency = document.getElementById("currency").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    const expenseData = {
      currency,
      amount,
      category,
      date,
      note,
    };
    const createdExpense = expenseManager.addExpense(expenseData);
    addExpenseForm.reset();
    renderExpenses();
    errorMessage.textContent = "";

    console.log("Expense created: ", createdExpense);
    console.log(expenseManager.getExpenses());
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
}

// delete expense card
function deleteExpenseCard(id) {
  expenseManager.deleteExpense(id);
  renderExpenses(expenseManager.getExpenses());
}

// edit expense card
let editingExpenseId = null;
function editExpenseCard(id) {
  editingExpenseId = id;
  renderExpenses();
}

// edit / delete expense card button
const expenseList = document.getElementById("expenseList");

expenseList.addEventListener("click", (event) => {
  try {
    event.preventDefault(); // preventing reload
    if (event.target.classList.contains("delete-btn")) {
      deleteExpenseCard(Number(event.target.dataset.id));
    } else if (event.target.classList.contains("edit-btn")) {
      editExpenseCard(Number(event.target.dataset.id));
    } else if (event.target.classList.contains("cancel-edit-btn")) {
      editingExpenseId = null;
      renderExpenses();
    } else if (event.target.classList.contains("confirm-edit-btn")) {
      const id = Number(event.target.dataset.id);
      const updatedExpense = {
        currency: document.getElementById(`edit-currency-${id}`).value,
        amount: Number(document.getElementById(`edit-amount-${id}`).value),
        category: document.getElementById(`edit-category-${id}`).value,
        date: document.getElementById(`edit-date-${id}`).value,
        note: document.getElementById(`edit-note-${id}`).value,
      };
      expenseManager.updateExpense(Number(id), updatedExpense);
      editingExpenseId = null;
      renderExpenses();
    }
  } catch (error) {
    const editCardErrorMessage = document.getElementById(
      `edit-error-${editingExpenseId}`,
    );
    editCardErrorMessage.textContent = error.message;
  }
});
