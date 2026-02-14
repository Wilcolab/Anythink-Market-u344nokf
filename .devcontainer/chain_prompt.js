/**
 * Converts a string to kebab-case format
 * @param {string} input - The string to convert
 * @returns {string} - The kebab-case formatted string
 * @throws {Error} - If input is not a string
 */
function toKebabCase(input) {
    // Error handling: check if input is a string
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    // Trim leading/trailing whitespace
    const trimmed = input.trim();

    // Handle empty strings
    if (trimmed.length === 0) {
        return '';
    }

    // Replace multiple delimiters (spaces, underscores, hyphens) with hyphens
    // Convert to lowercase and remove consecutive hyphens
    return trimmed
        .replace(/[\s_-]+/g, '-')
        .toLowerCase();
}

// Test cases
console.log('Test 1:', toKebabCase('Hello World'));
// Expected: "hello-world"

console.log('Test 2:', toKebabCase('Convert_this-string'));
// Expected: "convert-this-string"

console.log('Test 3:', toKebabCase('  Multiple   Spaces_and-dashes  '));
// Expected: "multiple-spaces-and-dashes"

console.log('Test 4:', toKebabCase(''));
// Expected: ""

try {
    toKebabCase(123);
} catch (error) {
    console.log('Test 5 (Error handling):', error.message);
    // Expected: "Input must be a string"
}