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
  return `
        <div class="expense-card">
            <h3>${expense.currency}</h3>
            <p>${expense.amount}</p>
            <p>${expense.category}</p>
            <p>${expense.date}</p>
            <p>${expense.note}</p>
            <button class="delete-btn" data-id="${expense.id}">Delete</button> 
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

const expenseList = document.getElementById("expenseList");
expenseList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    deleteExpenseCard(Number(event.target.dataset.id));
  }
});
