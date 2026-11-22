/**
 * Securely parses JSON strings that may be wrapped in Markdown code fences (e.g. ```json ... ```)
 * This is a common requirement when parsing raw AI outputs.
 * 
 * @param {string} text - The raw text response from the AI model
 * @returns {object} - The parsed JSON object
 * @throws {Error} - If parsing fails after stripping
 */
export function parseAiResponse(text) {
  if (typeof text !== 'string') {
    return text;
  }

  let cleaned = text.trim();

  // Strip leading ```json or ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Strip trailing ```
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();
  
  // Strip trailing commas from arrays and objects (common AI generation error)
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const snippet = cleaned.substring(0, 500).replace(/\n/g, '\\n');
    const parseError = new Error(`Failed to parse AI JSON response. (Snippet: "${snippet}...") Details: ${err.message}`);
    parseError.code = 'JSON_PARSE_ERROR';
    parseError.rawOutput = text;
    throw parseError;
  }
}
