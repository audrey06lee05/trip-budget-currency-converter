import Expense from "./expense.js";

class ExpenseManager {
  #expenses;
  #nextId;

  constructor() {
    this.#expenses = [];
    this.#nextId = 1;
    this.loadExpenses();
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
    this.saveExpenses();

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

    this.saveExpenses();

    return expense;
  }

  deleteExpense(id) {
    const targetExpense = this.getExpenseById(id);
    this.#expenses = this.#expenses.filter(
      (expense) => expense !== targetExpense,
    );

    this.saveExpenses();

    return targetExpense;
  }

  saveExpenses() {
    const expensesList = this.getExpenses().map((expense) => {
      return {
        id: expense.id,
        currency: expense.currency,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        note: expense.note,
      };
    });

    localStorage.setItem("tripBudgetExpenses", JSON.stringify(expensesList));
  }

  loadExpenses() {
    const savedExpenses = localStorage.getItem("tripBudgetExpenses");
    if (!savedExpenses) {
      return;
    } else {
      const tripBudgetExpenses = JSON.parse(savedExpenses);
      const loadedExpenses = tripBudgetExpenses.map((object) => {
        return new Expense(
          object.id,
          object.currency,
          object.amount,
          object.category,
          object.date,
          object.note,
        );
      });
      this.#expenses = loadedExpenses;
      const maxId = loadedExpenses.reduce((max, expense) => {
        if (expense.id > max) {
          max = expense.id;
        }
        return max;
      }, 0);
      this.#nextId = maxId + 1;
    }
  }
}

export default ExpenseManager;
