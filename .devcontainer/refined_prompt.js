/**
 * Converts a string to camelCase format.
 * 
 * Transforms the input string by:
 * - Splitting on whitespace, underscores, and hyphens
 * - Removing non-alphanumeric characters
 * - Capitalizing each word except the first one
 * - Joining all words without separators
 * 
 * @function toCamelCase
 * @param {string} input - The input string to convert
 * @returns {string} The converted camelCase string, or an empty string if no valid words remain
 * @throws {string} Returns error message if input is not a string
 * 
 * @example
 * toCamelCase('hello-world');        // Returns 'helloWorld'
 * toCamelCase('hello_world_foo');    // Returns 'helloWorldFoo'
 * toCamelCase('Hello World');        // Returns 'helloWorld'
 * toCamelCase('hello@world#test');   // Returns 'helloWorldTest'
 * toCamelCase(123);                  // Returns 'Error: Input must be a string'
 */

/**
 * Converts a string to dot.case format.
 * 
 * Transforms the input string by:
 * - Splitting on whitespace, underscores, and hyphens
 * - Removing non-alphanumeric characters
 * - Converting all characters to lowercase
 * - Joining all words with dots as separators
 * 
 * @function toDotCase
 * @param {string} input - The input string to convert
 * @returns {string} The converted dot.case string, or an empty string if no valid words remain
 * @throws {string} Returns error message if input is not a string
 * 
 * @example
 * toDotCase('hello-world');         // Returns 'hello.world'
 * toDotCase('hello_world_foo');     // Returns 'hello.world.foo'
 * toDotCase('Hello World');         // Returns 'hello.world'
 * toDotCase('hello@world#test');    // Returns 'hello.world.test'
 * toDotCase(123);                   // Returns 'Error: Input must be a string'
 */
function toCamelCase(input) {
    // Check if input is a string
    if (typeof input !== 'string') {
        return `Error: Input must be a string`;
    }

    // Trim leading and trailing whitespace
    const trimmed = input.trim();

    // Handle empty string
    if (trimmed.length === 0) {
        return '';
    }

    // Split by delimiters (spaces, underscores, hyphens) and filter empty strings
    const words = trimmed
        .split(/[\s_-]+/)
        .filter(word => word.length > 0)
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '')); // Remove non-alphanumeric characters

    // Filter out empty strings that may result from non-alphanumeric removal
    const validWords = words.filter(word => word.length > 0);

    // Handle case where no valid words remain
    if (validWords.length === 0) {
        return '';
    }

    // Convert to camelCase: first word lowercase, rest capitalized
    return validWords
        .map((word, index) => {
            const lowerWord = word.toLowerCase();
            return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');
}

module.exports = toCamelCase;

function toDotCase(input) {
    // Check if input is a string
    if (typeof input !== 'string') {
        return `Error: Input must be a string`;
    }

    // Trim leading and trailing whitespace
    const trimmed = input.trim();

    // Handle empty string
    if (trimmed.length === 0) {
        return '';
    }

    // Split by delimiters (spaces, underscores, hyphens) and filter empty strings
    const words = trimmed
        .split(/[\s_-]+/)
        .filter(word => word.length > 0)
        .map(word => word.replace(/[^a-zA-Z0-9]/g, '')); // Remove non-alphanumeric characters

    // Filter out empty strings that may result from non-alphanumeric removal
    const validWords = words.filter(word => word.length > 0);

    // Handle case where no valid words remain
    if (validWords.length === 0) {
        return '';
    }

    // Convert to dot.case: all lowercase, joined with dots
    return validWords
        .map(word => word.toLowerCase())
        .join('.');
}

module.exports = { toCamelCase, toDotCase };