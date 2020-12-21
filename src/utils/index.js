export function convertDollarsToCents(price) {
	return (Number.parseFloat(price) * 100).toFixed(0);
}

export function convertCentsToDollars(price) {
	return (Number.parseFloat(price) / 100).toFixed(2);
}

export const COMPARE_NOTES_CREATEDTIME_ASCENDING = function (a, b) {
	return new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime()
		? 1
		: -1;
};
