function toCamelCase(str) {
    return str
        .split(/[\s_-]+/)
        .filter(word => word.length > 0)
        .map((word, index) => {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
            if (index === 0) {
                return cleanWord.toLowerCase();
            }
            return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
        })
        .join('');
}

module.exports = toCamelCase;