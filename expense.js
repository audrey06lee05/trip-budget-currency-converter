// This class represents one expense.
class Expense {
  #id;
  #currency;
  #amount;
  #category;
  #date;
  #note;

  constructor(id, currency, amount, category, date, note) {
    this.#id = id;
    this.currency = currency;
    this.amount = amount;
    this.category = category;
    this.date = date;
    this.note = note;
  }

  get id() {
    return this.#id;
  }

  get amount() {
    return this.#amount;
  }
  set amount(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("Input type must be a number");
    }
    if (value <= 0) {
      throw new Error("Amount has to be more than 0");
    }
    this.#amount = value;
  }

  get currency() {
    return this.#currency;
  }
  set currency(value) {
    if (!value) {
      throw new Error("Currency cannot be empty");
    }
    if (typeof value !== "string") {
      throw new Error("Input type invalid");
    }
    this.#currency = value;
  }

  get category() {
    return this.#category;
  }
  set category(value) {
    if (!value) {
      throw new Error("Category cannot be empty");
    }
    if (typeof value !== "string") {
      throw new Error("Invalid category entered");
    }
    this.#category = value;
  }

  get date() {
    return this.#date;
  }
  set date(value) {
    if (!value) {
      throw new Error("Date cannot be empty");
    }
    if (typeof value !== "string") {
      throw new Error("Invalid date entered");
    }
    this.#date = value;
  }

  get note() {
    return this.#note;
  }
  set note(value) {
    if (!value) {
      value = "";
    }
    if (typeof value !== "string") {
      throw new Error("Invalid note entered.");
    }
    this.#note = value;
  }
}

export default Expense;
