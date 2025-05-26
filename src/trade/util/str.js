export function findFromRight(str, char) {
    // Reverse the string
    const reversed = str.split('').reverse().join('');
    
    // Find in reversed string
    const reversedIndex = reversed.indexOf(char);
    
    if (reversedIndex === -1) {
        return -1; // Character not found
    }
  
    // Convert back to original index
    return str.length - reversedIndex - 1;
}