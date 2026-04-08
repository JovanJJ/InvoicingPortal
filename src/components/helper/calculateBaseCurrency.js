export default async function calculateInBaseCurrency(baseCurrency) {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_RATES}/latest/${baseCurrency}`, {
        next: { revalidate: 86400 }
    });
    const rates = await res.json();
    return rates;
}