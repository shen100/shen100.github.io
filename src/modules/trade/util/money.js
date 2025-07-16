export function formatMoney(number /* float */, precision /* float */) {
	if (number === 0) {
		let str = "0.";
        for (let i = 0; i < precision; i++) {
            str += "0";
        }
        return str;
    }
	return Math.abs(number).toFixed(precision).toLocaleString();
}