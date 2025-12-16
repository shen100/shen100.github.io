export function formatMoney(number /* float */, precision /* float */) {
	let str = Number(number.toFixed(precision)).toLocaleString(undefined, {
        minimumFractionDigits: precision,  // 最小小数位数
    });
    if (number === 0) {
		str = "0";
    }
    if (str.indexOf('.') < 0) {
        str += '.';
        for (let i = 0; i < precision; i++) {
            str += "0";
        }
    } else {
        let parts = str.split('.');
        if (parts[1].length < precision) {
            for (let i = parts[1].length; i < precision; i++) {
                parts[1] += "0";
            }
        }
        str = parts.join('.');
    }
    return str;
}