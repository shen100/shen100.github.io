/**
 * 从字符串右侧开始查找指定字符，返回该字符最后一次出现的位置
 * @param {string} str - 要搜索的字符串
 * @param {string} char - 要查找的字符
 * @returns {number} 字符最后一次出现的位置，如果未找到则返回-1
 */
export function findFromRight(str, char) {
    const reversed = str.split('').reverse().join('');
    
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1;
    }
  
    return str.length - reversedIndex - 1;
}