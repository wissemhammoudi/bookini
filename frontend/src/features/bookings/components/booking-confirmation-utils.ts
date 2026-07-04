export const formatDate = (
  dateValue: unknown,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions,
) => {
  if (typeof dateValue !== 'string' || !dateValue) {
    return 'N/A'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString(locale, options)
}

export const formatPrice = (priceValue: unknown) => {
  const numeric = typeof priceValue === 'number' ? priceValue : Number(priceValue)
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00'
}
