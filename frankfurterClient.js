class FrankfurterClient {
  #ratesCache = new Map();
  #historicalRatesCache = new Map();

  async getCurrencyList() {
    const response = await fetch("https://api.frankfurter.dev/v2/currencies");
    const data = await response.json();
    return data;
  }

  async getLatestRates(base) {
    if (this.#ratesCache.has(base)) {
      return this.#ratesCache.get(base);
    }
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${base}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates for ${base}: ${response.status}`);
    }
    const data = await response.json();
    this.#ratesCache.set(base, data);
    return data;
  }

  async getHistoricalRates(date, base) {
    const cacheKey = `${date}_${base}`;
    if (this.#historicalRatesCache.has(cacheKey)) {
      return this.#historicalRatesCache.get(cacheKey);
    }
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rates?date=${date}&base=${base}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates for ${base} on ${date}: ${response.status}`);
    }
    const data = await response.json();
    this.#historicalRatesCache.set(cacheKey, data);
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

    return amount * matchingRate.rate;
  }

  async convertAmountOnDate(amount, from, to, date) {
    if (from === to) {
      return amount;
    }
    const rates = await this.getHistoricalRates(date, from);
    const matchingRate = rates.find((rate) => rate.quote === to);

    if (!matchingRate) {
      throw new Error(`Currency rate not found for ${from} on ${date}`);
    }

    return amount * matchingRate.rate;
  }
}

export default FrankfurterClient;
