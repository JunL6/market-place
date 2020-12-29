import { format } from "date-fns";

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

const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
export function displayDate(date) {
	return `${
		MONTH_NAMES[date.getMonth()]
	} ${date.getDate()}, ${date.getFullYear()}`;
}

export function displayTime(date) {
	return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function convertTime(date) {
	return format(date, "MMM d, yyyy kk:mm:ss");
}
