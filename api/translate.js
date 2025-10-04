// Vercel Serverless Function for DeepL Translation
// This proxies requests to avoid CORS issues

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, targetLang, sourceLang = 'FR' } = req.body;

  // Validate inputs
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters: text and targetLang' });
  }

  const DEEPL_API_KEY = process.env.VITE_DEEPL_API_KEY;

  if (!DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' });
  }

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text,
        target_lang: targetLang.toUpperCase(),
        source_lang: sourceLang.toUpperCase(),
        preserve_formatting: '1'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'DeepL API error' });
    }

    const data = await response.json();
    return res.status(200).json({
      translatedText: data.translations[0].text
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation failed' });
  }
}
