(function (global) {
  function normalizeCurrency(currency) {
    if (currency == null) return 'UNK';
    const trimmed = String(currency).trim();
    return trimmed || 'UNK';
  }

  function toNumber(value) {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  }

  function summarizePaidTotals(rows = []) {
    const totalsByCurrency = {};
    for (const row of rows) {
      if (!row) continue;
      const currency = normalizeCurrency(row.currency);
      const amount = toNumber(row.amount);
      totalsByCurrency[currency] = (totalsByCurrency[currency] || 0) + amount;
    }
    return { totalsByCurrency };
  }

  function formatPaidTotalsLabel(summary) {
    const totals = summary && summary.totalsByCurrency ? summary.totalsByCurrency : {};
    const entries = Object.entries(totals);
    if (!entries.length) return 'Totals: 0';
    const parts = entries.map(([currency, sum]) => `${currency} ${sum.toFixed(2)}`);
    return `Totals: ${parts.join(' • ')}`;
  }

  const api = { summarizePaidTotals, formatPaidTotalsLabel };
  global.JMTotals = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
