export function convertDollarsToCents(price) {
	return (Number.parseFloat(price) * 100).toFixed(0);
}

export function convertCentsToDollars(price) {
	return (Number.parseFloat(price) / 100).toFixed(2);
}
