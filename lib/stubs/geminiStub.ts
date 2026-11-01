// Used only in the single-file preview build, where no API key is available.
const MSG = 'The AI assistant is switched off in this preview. Run the full project with a GEMINI_API_KEY to use Gene.';
export const sendMessageToGemini = async (..._a: unknown[]) => MSG;
export async function* streamMessageToGemini(..._a: unknown[]) {
  yield MSG;
}
