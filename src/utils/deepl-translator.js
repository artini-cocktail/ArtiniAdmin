// DeepL Translation Utility
// Pour utiliser cette fonctionnalité, ajoutez votre clé API DeepL dans .env:
// VITE_DEEPL_API_KEY=votre_clé_ici

const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'; // ou https://api.deepl.com/v2/translate pour la version payante

/**
 * Traduit un texte avec DeepL
 * @param {string} text - Texte à traduire
 * @param {string} targetLang - Langue cible (ex: 'EN', 'ES', 'DE', 'IT')
 * @param {string} sourceLang - Langue source (ex: 'FR') - optionnel
 * @returns {Promise<string>} - Texte traduit
 */
export async function translateText(text, targetLang, sourceLang = 'FR') {
  if (!DEEPL_API_KEY) {
    throw new Error('Clé API DeepL non configurée. Ajoutez VITE_DEEPL_API_KEY dans votre fichier .env');
  }

  if (!text || text.trim() === '') {
    return text;
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
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
      throw new Error(error.message || 'Erreur lors de la traduction');
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation error:', error);
    throw error;
  }
}

/**
 * Traduit un objet de traductions de manière récursive
 * @param {Object} obj - Objet de traductions à traduire
 * @param {string} targetLang - Langue cible
 * @param {string} sourceLang - Langue source
 * @param {Function} onProgress - Callback pour suivre la progression
 * @returns {Promise<Object>} - Objet traduit
 */
export async function translateObject(obj, targetLang, sourceLang = 'FR', onProgress = null) {
  const result = {};
  const entries = Object.entries(obj);
  let processed = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line no-await-in-loop
        result[key] = await translateText(value, targetLang, sourceLang);
        processed += 1;
        if (onProgress) {
          onProgress(processed, entries.length);
        }
        // Petit délai pour éviter de dépasser les limites de taux de l'API
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => { setTimeout(resolve, 100); });
      } catch (error) {
        console.error(`Erreur lors de la traduction de "${key}":`, error);
        result[key] = value; // Garder la valeur originale en cas d'erreur
      }
    } else if (typeof value === 'object' && value !== null) {
      // eslint-disable-next-line no-await-in-loop
      result[key] = await translateObject(value, targetLang, sourceLang, onProgress);
    } else {
      result[key] = value;
    }
  }

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
