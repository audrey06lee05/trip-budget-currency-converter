import Expense from "./expense.js";

class ExpenseManager {
  #expenses;
  #nextId;

  constructor() {
    this.#expenses = [];
    this.#nextId = 1;
  }

  addExpense(expenseData) {
    const newExpense = new Expense(
      this.#nextId,
      expenseData.currency,
      expenseData.amount,
      expenseData.category,
      expenseData.date,
      expenseData.note,
    );

    this.#expenses.push(newExpense);
    this.#nextId++;

    return newExpense;
  }

  getExpenses() {
    return [...this.#expenses];
  }

  getExpenseById(id) {
    const expense = this.#expenses.find((expense) => expense.id === id);
    if (!expense) {
      throw new Error("Expense ID not found");
    }
    return expense;
  }

  updateExpense(id, updatedExpense) {
    const expense = this.getExpenseById(id);
    if ("id" in updatedExpense) {
      throw new Error("Expense id cannot be updated");
    }
    if ("currency" in updatedExpense) {
      expense.currency = updatedExpense.currency;
    }
    if ("amount" in updatedExpense) {
      expense.amount = updatedExpense.amount;
    }
    if ("category" in updatedExpense) {
      expense.category = updatedExpense.category;
    }
    if ("date" in updatedExpense) {
      expense.date = updatedExpense.date;
    }
    if ("note" in updatedExpense) {
      expense.note = updatedExpense.note;
    }

    return expense;
  }

  deleteExpense(id) {
    const targetExpense = this.getExpenseById(id);
    this.#expenses = this.#expenses.filter(
      (expense) => expense !== targetExpense,
    );
    return targetExpense;
  }
}

export default ExpenseManager;
