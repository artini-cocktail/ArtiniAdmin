import { useState } from 'react';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { translateObject, SUPPORTED_LANGUAGES } from 'src/utils/deepl-translator';

import Iconify from 'src/components/iconify';

import TranslationEditor from './translation-editor';

// ----------------------------------------------------------------------

export default function TranslationsView() {
  const theme = useTheme();
  const [translations, setTranslations] = useState({});
  const [languageCode, setLanguageCode] = useState('');
  const [languageName, setLanguageName] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [sourceTranslations, setSourceTranslations] = useState(null);
  const [targetLang, setTargetLang] = useState('EN');

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setTranslations(imported);
        toast.success('Fichier importé avec succès !');
      } catch (error) {
        toast.error('Erreur lors de l\'import du fichier JSON');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    if (Object.keys(translations).length === 0) {
      toast.warning('Aucune traduction à exporter');
      return;
    }

    const dataStr = JSON.stringify(translations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${languageCode || 'translations'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier exporté avec succès !');
  };

  const handleCreateNew = () => {
    if (!languageCode || !languageName) {
      toast.warning('Veuillez entrer un code et un nom de langue');
      return;
    }

    // Structure de base des traductions
    const baseStructure = {
      common: {
        actions: {},
        labels: {},
        messages: {},
        navigation: {}
      },
      business: {
        cocktail: {},
        user: {},
        collection: {},
        categories: {},
        badges: {}
      },
      pages: {},
      offline: {},
      errors: {},
      success: {},
      filters: {},
      contextMenu: {},
      input: {},
      lists: {},
      header: {},
      option: {}
    };

    setTranslations(baseStructure);
    toast.success(`Nouveau fichier de traduction créé pour ${languageName} (${languageCode})`);
  };

  const handleAutoTranslate = async () => {
    if (!sourceTranslations) {
      toast.warning('Veuillez d\'abord importer un fichier source (ex: fr.json)');
      return;
    }

    if (!targetLang) {
      toast.warning('Veuillez sélectionner une langue cible');
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);

    try {
      let totalKeys = 0;
      let processedKeys = 0;

      // Compter le nombre total de clés
      const countKeys = (obj) => {
        let count = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            count += 1;
          } else if (typeof value === 'object' && value !== null) {
            count += countKeys(value);
          }
        }
        return count;
      };

      totalKeys = countKeys(sourceTranslations);

      const onProgress = (processed) => {
        processedKeys = processed;
        setTranslationProgress(Math.round((processed / totalKeys) * 100));
      };

      const translated = await translateObject(
        sourceTranslations,
        targetLang,
        'FR',
        onProgress
      );

      setTranslations(translated);
      toast.success(`Traduction terminée ! ${processedKeys} clés traduites`);
    } catch (error) {
      console.error('Translation error:', error);
      if (error.message.includes('Clé API') || error.message.includes('not configured')) {
        toast.error('Clé API DeepL non configurée dans les variables d\'environnement Vercel');
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        toast.error('Limite de requêtes DeepL atteinte. Attendez quelques minutes.');
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setIsTranslating(false);
      // Attendre un peu avant de réinitialiser la progression
      setTimeout(() => {
        setTranslationProgress(0);
      }, 2000);
    }
  };

  const handleImportSource = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setSourceTranslations(imported);
        toast.success('Fichier source importé avec succès !');
      } catch (error) {
        toast.error('Erreur lors de l\'import du fichier source');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Gestion des Traductions</Typography>
      </Stack>

      {/* Controls Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={3}>
          {/* Language Info */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Code de langue (ex: es, de, it)"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value.toLowerCase())}
              placeholder="es"
              helperText="Code ISO 639-1 (2 lettres)"
            />
            <TextField
              fullWidth
              label="Nom de la langue"
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              placeholder="Español"
            />
          </Stack>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleCreateNew}
              sx={{ minWidth: 200 }}
            >
              Nouvelle traduction
            </Button>

            <Button
              variant="outlined"
              component="label"
              startIcon={<Iconify icon="eva:upload-fill" />}
              sx={{ minWidth: 200 }}
            >
              Importer JSON
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportJSON}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:download-fill" />}
              onClick={handleExportJSON}
              disabled={Object.keys(translations).length === 0}
              sx={{ minWidth: 200 }}
            >
              Exporter JSON
            </Button>
          </Stack>

          {/* DeepL Translation Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Auto-traduction avec DeepL
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<Iconify icon="eva:file-add-fill" />}
                sx={{ minWidth: 180 }}
              >
                Import source (FR)
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImportSource}
                />
              </Button>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Langue cible</InputLabel>
                <Select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  label="Langue cible"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LoadingButton
                variant="contained"
                color="secondary"
                startIcon={<Iconify icon="eva:globe-2-fill" />}
                onClick={handleAutoTranslate}
                loading={isTranslating}
                disabled={!sourceTranslations}
                sx={{ minWidth: 180 }}
              >
                Traduire tout
              </LoadingButton>

              {sourceTranslations && (
                <Chip
                  icon={<Iconify icon="eva:checkmark-circle-fill" width={16} />}
                  label="Source chargé"
                  color="success"
                  size="small"
                />
              )}
            </Stack>

            {isTranslating && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress variant="determinate" value={translationProgress} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {translationProgress}%
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify
                icon="eva:info-fill"
                sx={{ color: 'info.main', mt: 0.5 }}
                width={20}
              />
              <Box>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Comment utiliser
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1. Créez une nouvelle traduction ou importez un fichier JSON existant<br />
                  2. Modifiez les traductions dans l&apos;éditeur ci-dessous<br />
                  3. Utilisez l&apos;auto-traduction DeepL pour les clés manquantes<br />
                  4. Exportez le fichier JSON final
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      {/* Translation Editor */}
      {Object.keys(translations).length > 0 && (
        <TranslationEditor
          translations={translations}
          onTranslationsChange={setTranslations}
          languageCode={languageCode}
        />
      )}

      {/* Empty State */}
      {Object.keys(translations).length === 0 && (
        <Card
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <Iconify
            icon="eva:file-text-outline"
            sx={{
              width: 120,
              height: 120,
              color: 'text.disabled',
              mb: 3,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune traduction chargée
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Créez une nouvelle traduction ou importez un fichier JSON pour commencer
          </Typography>
        </Card>
      )}
    </Container>
  );
}
