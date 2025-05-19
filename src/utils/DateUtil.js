export default {
    formatLocalYMDHMS: function(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        if (typeof date === 'number') {
            date = new Date(date);
        }
        let month = date.getMonth();
        let d = date.getDate();
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        month = month + 1;
        month = month < 9 ? '0' + month : month;
        d = d < 9 ? '0' + d : d;
        h = h < 9 ? '0' + h : h;
        m = m < 9 ? '0' + m : m;
        s = s < 9 ? '0' + s : s;
        let arr = [
            date.getFullYear() + '-' + month + '-' + d,
            ' ',
            h + ':' + m + ':' + s
        ];
        return arr.join('');
    }
}