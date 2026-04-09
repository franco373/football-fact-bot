const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkFactWithGemini(claim) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a highly accurate football (soccer) fact-checking AI.

RULES:
- Do NOT guess
- Do NOT hallucinate
- Only use real football data
- If unsure, say UNCERTAIN

FORMAT USING DISCORD MARKDOWN:

**Verdict:** [TRUE / FALSE / PARTLY TRUE / UNCERTAIN]

**Explanation:**
- Include stats or facts

**Context:**
- Optional clarification

CLAIM:
${claim}`;

    let retries = 3;
    while (retries > 0) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            if (error.message && error.message.includes('503') && retries > 1) {
                console.log(`[Gemini API] Servers busy (503). Retrying in 2 seconds... (${retries - 1} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                retries--;
                continue;
            }
            console.error("====================================");
            console.error("❌ GEMINI API ERROR:");
            console.error(error.message || error);
            console.error("====================================");
            throw new Error("Failed to reach the fact-checking AI. Please try again later.");
        }
    }
}

module.exports = { checkFactWithGemini };