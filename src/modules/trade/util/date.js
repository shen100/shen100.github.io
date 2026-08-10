export function formatLocalYMD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 将 Date 类型的对象格式化为 "0930", 只返回小时分钟 
 */
export function formatLocalHHMM(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return hh + mm;
}

export function formatLocalYMDHMS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function parseLocalYMDString(dateStr) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 月份是0-11
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

export function utcStringToLocalString(utcString) {
    const date = new Date(utcString);
    
    // 获取本地时间的各个部分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getDayDiff(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    // 毫秒转天数
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    return Math.round(diffMs / msPerDay);
}

export function getNextDay(dateStr) {
    const date = new Date(dateStr);
    // 加一天
    date.setDate(date.getDate() + 1);
    // 格式化为 YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}