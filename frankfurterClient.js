class FrankfurterClient {
  async getCurrencyList() {
    const response = await fetch("https://api.frankfurter.dev/v2/currencies");
    const data = await response.json();
    return data;
  }
}

export default FrankfurterClient;
