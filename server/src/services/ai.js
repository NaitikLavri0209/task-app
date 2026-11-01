const AppError = require('../utils/AppError');

const PRIORITIES = ['low', 'medium', 'high'];

// Breaks a goal into subtasks using the Gemini API. Every failure mode maps to a friendly AppError.
async function suggestSubtasks(goal) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AppError('AI assistant is not configured (GEMINI_API_KEY missing).', 503);
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = `Break this goal into 3-6 concrete, actionable tasks: "${goal}".
Reply ONLY with a JSON array of objects: {"title": string (max 80 chars), "description": string (max 200 chars), "priority": "low"|"medium"|"high"}.`;

  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
  } catch (e) {
    throw new AppError(e.name === 'TimeoutError' ? 'The AI service timed out. Please try again.' : 'Could not reach the AI service.', 504);
  }
  if (res.status === 429) throw new AppError('AI rate limit reached. Please try again in a moment.', 429);
  if (!res.ok) throw new AppError('The AI service returned an error. Please try again later.', 502);

  try {
    const data = await res.json();
    const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return parsed.slice(0, 8).map((t) => ({
      title: String(t.title || '').slice(0, 100),
      description: String(t.description || '').slice(0, 500),
      priority: PRIORITIES.includes(t.priority) ? t.priority : 'medium',
    })).filter((t) => t.title);
  } catch {
    throw new AppError('The AI returned an unreadable response. Please try again.', 502);
  }
}
module.exports = { suggestSubtasks };
