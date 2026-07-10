class CurrencyConversionService {
  #frankfurterClient;

  constructor(frankfurterClient) {
    this.#frankfurterClient = frankfurterClient;
  }

  groupByCategory(expenses) {
    return expenses.reduce((groups, expense) => {
      const category = expense.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(expense);
      return groups;
    }, {});
  }

  async convertExpense(expense, baseCurrency) {
    return this.#frankfurterClient.convertAmountOnDate(
      expense.amount,
      expense.currency,
      baseCurrency,
      expense.date,
    );
  }

  async getDailySpend(expenses, baseCurrency) {
    const dailyTotals = {};

    for (const expense of expenses) {
      const converted = await this.convertExpense(expense, baseCurrency);
      if (!dailyTotals[expense.date]) {
        dailyTotals[expense.date] = 0;
      }
      dailyTotals[expense.date] += converted;
    }

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }

  async calculateBudgetSummary(expenses, baseCurrency) {
    const grouped = this.groupByCategory(expenses);
    const summary = {};

    for (const [category, categoryExpenses] of Object.entries(grouped)) {
      let total = 0;
      for (const expense of categoryExpenses) {
        const converted = await this.convertExpense(expense, baseCurrency);
        total += converted;
      }
      summary[category] = total;
    }

    return summary;
  }
}

export default CurrencyConversionService;
