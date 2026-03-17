export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Build conversation history for Gemini
        const contents = [];

        // Add chat history if provided
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                contents.push({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                });
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: `You are the Architect AI — a sharp, motivating skincare and wellness assistant built into a personal OS called Architect. 
You speak in short, direct, confident sentences. You help the user stay consistent with their skincare routine, track hydration, build streaks, and level up their discipline.
Keep responses concise (2-4 sentences max). Use emojis sparingly. Never be generic — be specific and actionable.
The user's routine includes: Face Wash, Moisturizer & SPF in the morning, 3.5L hydration daily, Deep Cleansing and Retinol Recovery at night.`
                        }]
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            return res.status(500).json({ error: 'No response from Gemini' });
        }

        return res.status(200).json({ reply });

    } catch (err) {
        console.error('Gemini proxy error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
