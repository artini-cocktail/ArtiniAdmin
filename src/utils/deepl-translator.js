// DeepL Translation Utility
// Utilise une fonction serverless Vercel pour éviter les problèmes CORS
// La clé API DeepL doit être configurée dans les variables d'environnement Vercel

/**
 * Traduit un texte avec DeepL via notre API serverless
 * @param {string} text - Texte à traduire
 * @param {string} targetLang - Langue cible (ex: 'EN', 'ES', 'DE', 'IT')
 * @param {string} sourceLang - Langue source (ex: 'FR') - optionnel
 * @returns {Promise<string>} - Texte traduit
 */
export async function translateText(text, targetLang, sourceLang = 'FR') {
  if (!text || text.trim() === '') {
    return text;
  }

  try {
    console.log(`🔄 Traduction: "${text.substring(0, 50)}..." vers ${targetLang}`);

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang: targetLang.toUpperCase(),
        sourceLang: sourceLang.toUpperCase(),
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      console.error('❌ Erreur API:', error);
      throw new Error(error.error || 'Erreur lors de la traduction');
    }

    const data = await response.json();
    console.log(`✅ Traduit: "${data.translatedText.substring(0, 50)}..."`);
    return data.translatedText;
  } catch (error) {
    console.error('❌ DeepL translation error:', error);
    throw error;
  }
}

/**
 * Traduit un lot de textes en une seule requête
 * @param {Array<string>} texts - Textes à traduire
 * @param {string} targetLang - Langue cible
 * @param {string} sourceLang - Langue source
 * @returns {Promise<Array<string>>} - Textes traduits
 */
async function translateBatch(texts, targetLang, sourceLang = 'FR') {
  if (texts.length === 0) return [];

  try {
    console.log(`🔄 Traduction batch de ${texts.length} textes vers ${targetLang}`);

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        targetLang: targetLang.toUpperCase(),
        sourceLang: sourceLang.toUpperCase(),
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      console.error('❌ Erreur API batch:', error);
      throw new Error(error.error || 'Erreur lors de la traduction batch');
    }

    const data = await response.json();
    console.log(`✅ Batch traduit: ${texts.length} textes`);
    return data.translatedTexts;
  } catch (error) {
    console.error('❌ DeepL batch translation error:', error);
    throw error;
  }
}

/**
 * Traduit un objet de traductions de manière récursive avec batch
 * @param {Object} obj - Objet de traductions à traduire
 * @param {string} targetLang - Langue cible
 * @param {string} sourceLang - Langue source
 * @param {Function} onProgress - Callback pour suivre la progression
 * @returns {Promise<Object>} - Objet traduit
 */
export async function translateObject(obj, targetLang, sourceLang = 'FR', onProgress = null) {
  // Collecter tous les textes à traduire avec leurs chemins
  const textsToTranslate = [];

  const collectTexts = (o, path = []) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(o)) {
      if (typeof value === 'string') {
        textsToTranslate.push({ path: [...path, key], text: value });
      } else if (typeof value === 'object' && value !== null) {
        collectTexts(value, [...path, key]);
      }
    }
  };

  collectTexts(obj);

  const totalKeys = textsToTranslate.length;
  console.log(`📊 Total de ${totalKeys} textes à traduire`);

  // Traduire par lots de 50 textes (limite DeepL)
  const BATCH_SIZE = 50;
  const translatedTexts = [];

  // eslint-disable-next-line no-restricted-syntax
  for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
    const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
    const texts = batch.map(item => item.text);

    try {
      // eslint-disable-next-line no-await-in-loop
      const translations = await translateBatch(texts, targetLang, sourceLang);
      translatedTexts.push(...translations);

      if (onProgress) {
        const processed = Math.min(i + BATCH_SIZE, totalKeys);
        onProgress(processed, totalKeys);
      }

      // Petit délai entre les batches pour éviter les rate limits
      if (i + BATCH_SIZE < textsToTranslate.length) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => { setTimeout(resolve, 1000); });
      }
    } catch (error) {
      console.error(`Erreur lors de la traduction du batch ${i / BATCH_SIZE + 1}:`, error);
      // En cas d'erreur, garder les valeurs originales pour ce batch
      translatedTexts.push(...texts);
    }
  }

  // Reconstruire l'objet avec les traductions
  const result = JSON.parse(JSON.stringify(obj)); // Deep clone

  textsToTranslate.forEach((item, index) => {
    let current = result;
    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < item.path.length - 1; i += 1) {
      current = current[item.path[i]];
    }
    current[item.path[item.path.length - 1]] = translatedTexts[index];
  });

  return result;
}

/**
 * Traduit uniquement les clés vides ou manquantes
 * @param {Object} targetObj - Objet cible avec traductions partielles
 * @param {Object} sourceObj - Objet source avec traductions complètes
 * @param {string} targetLang - Langue cible
 * @param {string} sourceLang - Langue source
 * @param {Function} onProgress - Callback pour suivre la progression
 * @returns {Promise<Object>} - Objet avec traductions complétées
 */
export async function fillMissingTranslations(targetObj, sourceObj, targetLang, sourceLang = 'FR', onProgress = null) {
  const result = { ...targetObj };
  let processed = 0;
  let totalToTranslate = 0;

  // Compter d'abord combien de clés doivent être traduites
  const countMissing = (target, source) => {
    let count = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (typeof sourceValue === 'string') {
        if (!targetValue || targetValue.trim() === '') {
          count += 1;
        }
      } else if (typeof sourceValue === 'object' && sourceValue !== null) {
        count += countMissing(targetValue || {}, sourceValue);
      }
    }
    return count;
  };

  totalToTranslate = countMissing(targetObj, sourceObj);

  // Traduire les clés manquantes
  const sourceEntries = Object.entries(sourceObj);

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, sourceValue] of sourceEntries) {
    const targetValue = result[key];

    if (typeof sourceValue === 'string') {
      if (!targetValue || targetValue.trim() === '') {
        try {
          // eslint-disable-next-line no-await-in-loop
          result[key] = await translateText(sourceValue, targetLang, sourceLang);
          processed += 1;
          if (onProgress) {
            onProgress(processed, totalToTranslate);
          }
          // eslint-disable-next-line no-await-in-loop
          await new Promise(resolve => { setTimeout(resolve, 100); });
        } catch (error) {
          console.error(`Erreur lors de la traduction de "${key}":`, error);
          result[key] = sourceValue;
        }
      }
    } else if (typeof sourceValue === 'object' && sourceValue !== null) {
      // eslint-disable-next-line no-await-in-loop
      result[key] = await fillMissingTranslations(
        targetValue || {},
        sourceValue,
        targetLang,
        sourceLang,
        onProgress
      );
    }
  }

  return result;
}

/**
 * Langues supportées par DeepL
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'BG', name: 'Bulgare' },
  { code: 'CS', name: 'Tchèque' },
  { code: 'DA', name: 'Danois' },
  { code: 'DE', name: 'Allemand' },
  { code: 'EL', name: 'Grec' },
  { code: 'EN', name: 'Anglais' },
  { code: 'ES', name: 'Espagnol' },
  { code: 'ET', name: 'Estonien' },
  { code: 'FI', name: 'Finnois' },
  { code: 'FR', name: 'Français' },
  { code: 'HU', name: 'Hongrois' },
  { code: 'ID', name: 'Indonésien' },
  { code: 'IT', name: 'Italien' },
  { code: 'JA', name: 'Japonais' },
  { code: 'KO', name: 'Coréen' },
  { code: 'LT', name: 'Lituanien' },
  { code: 'LV', name: 'Letton' },
  { code: 'NB', name: 'Norvégien' },
  { code: 'NL', name: 'Néerlandais' },
  { code: 'PL', name: 'Polonais' },
  { code: 'PT', name: 'Portugais' },
  { code: 'RO', name: 'Roumain' },
  { code: 'RU', name: 'Russe' },
  { code: 'SK', name: 'Slovaque' },
  { code: 'SL', name: 'Slovène' },
  { code: 'SV', name: 'Suédois' },
  { code: 'TR', name: 'Turc' },
  { code: 'UK', name: 'Ukrainien' },
  { code: 'ZH', name: 'Chinois' },
];
