class FrankfurterClient {
  async getCurrencyList() {
    const response = await fetch("https://api.frankfurter.dev/v2/currencies");
    const data = await response.json();
    return data;
  }

  async getLatestRates(base) {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${base}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates for ${base}: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  async convertAmount(amount, from, to) {
    if (from === to) {
      return amount;
    }
    const rates = await this.getLatestRates(from);
    const matchingRate = rates.find((rate) => {
      return rate.quote === to;
    });

    if (!matchingRate) {
      throw new Error("Currency rate not found");
    }

    const convertedAmount = amount * matchingRate.rate;
    return convertedAmount;
  }
}

export default FrankfurterClient;
