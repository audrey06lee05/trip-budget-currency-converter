# 💸 Trip Budget & Currency Converter

✨ A travel expense tracker that lets you log expenses in any currency and instantly see your total spend converted into your home currency — using real, date-accurate exchange rates.

Built with vanilla JavaScript, HTML, and CSS — no frameworks, no build tools. All data is persisted in localStorage so your expenses are saved across sessions.

## 🗣️ Language & Technologies
* JavaScript (ES6+ Classes, Modules, Async/Await)
* HTML5
* CSS3
* [Frankfurter API](https://frankfurter.dev/) — free, no API key required
* [Chart.js](https://www.chartjs.org/) — daily spend line chart

## ⚜️ Key Features
* **Multi-currency expense tracking** — log expenses in any currency, converted to your base currency using the exchange rate from the date of the expense
* **Historical rate accuracy** — conversions use the actual rate from the expense date, not today's rate
* **Category breakdown** — expenses grouped by category with totals in your base currency
* **Daily spend chart** — line chart showing spending over time
* **Inline editing** — edit any expense directly in the list
* **Custom categories** — add your own categories on top of the predefined ones
* **Persistent storage** — expenses, base currency, and custom categories saved to localStorage
* **Conversion preview** — see the converted amount before submitting an expense

## 🏗️ Architecture
The app is structured around four core classes:

| Class | Responsibility |
|---|---|
| `FrankfurterClient` | Fetches latest and historical exchange rates from the Frankfurter API, with in-session caching |
| `Expense` | Represents a single expense with private fields and validated setters |
| `ExpenseManager` | CRUD operations for expenses with localStorage persistence |
| `CurrencyConversionService` | Converts expenses using historical rates, groups by category, calculates budget summaries and daily spend |

## 🚀 Deployment
The app is deployed via **GitHub Pages** — no build step or server required.

To deploy your own copy:
1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to your main branch, root folder (`/`)
4. GitHub Pages will publish it at `https://<your-username>.github.io/trip-budget-currency-converter/`

## 🔧 Running Locally
1. Clone the repository
2. Serve it with a local HTTP server — ES Modules require HTTP, not `file://`
   * VS Code: use the **Live Server** extension
   * Terminal: run `npx serve .`
3. Select a base currency from the header dropdown to get started

## 📌 How to Use

#### ➕ Add an Expense
1. Select the currency the expense was made in
2. Enter the amount — a live conversion preview will appear
3. Choose a category (or add a custom one)
4. Pick the date (today or earlier)
5. Optionally add a note
6. Press **Add Expense**

#### ✏️ Edit or Delete
* Press **Edit** on any expense card to edit it inline
* Press **Delete** to remove it permanently

#### 📊 View Summary
* The header shows your **total spend** in the base currency
* The **Category Breakdown** section shows totals per category
* The **Daily Spend** chart shows your spending trend over time
