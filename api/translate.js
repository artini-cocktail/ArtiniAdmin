// Vercel Serverless Function for DeepL Translation
// Supports batch translation for better performance

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texts, targetLang, sourceLang = 'FR' } = req.body;

  // Validate inputs - support both single text (string) and batch (array)
  if (!texts || !targetLang) {
    return res.status(400).json({ error: 'Missing required parameters: texts and targetLang' });
  }

  const DEEPL_API_KEY = process.env.VITE_DEEPL_API_KEY;

  if (!DEEPL_API_KEY) {
    return res.status(500).json({ error: 'DeepL API key not configured' });
  }

  try {
    // DeepL accepts multiple texts in a single request
    const textsArray = Array.isArray(texts) ? texts : [texts];

    const params = new URLSearchParams({
      auth_key: DEEPL_API_KEY,
      target_lang: targetLang.toUpperCase(),
      source_lang: sourceLang.toUpperCase(),
      preserve_formatting: '1'
    });

    // Add each text as a separate 'text' parameter
    textsArray.forEach(text => {
      params.append('text', text);
    });

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'DeepL API error' });
    }

    const data = await response.json();

    // Return array of translated texts or single text
    if (Array.isArray(texts)) {
      return res.status(200).json({
        translatedTexts: data.translations.map(t => t.text)
      });
    }

    return res.status(200).json({
      translatedText: data.translations[0].text
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation failed' });
  }
}
