import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TranslationEditor({ translations, onTranslationsChange, languageCode }) {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  // Get current object based on path
  const currentObject = useMemo(() => {
    let obj = translations;
    // eslint-disable-next-line no-restricted-syntax
    for (const key of currentPath) {
      obj = obj[key];
    }
    return obj;
  }, [translations, currentPath]);

  // Filter keys based on search
  const filteredKeys = useMemo(() => {
    const keys = Object.keys(currentObject || {});
    if (!searchQuery) return keys;
    return keys.filter(key =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof currentObject[key] === 'string' &&
       currentObject[key].toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [currentObject, searchQuery]);

  const handleNavigate = (key) => {
    if (typeof currentObject[key] === 'object' && currentObject[key] !== null) {
      setCurrentPath([...currentPath, key]);
      setSearchQuery('');
    }
  };

  const handleBreadcrumbClick = (index) => {
    setCurrentPath(currentPath.slice(0, index));
    setSearchQuery('');
  };

  const handleValueChange = (key, newValue) => {
    const updateNestedObject = (obj, path, value) => {
      if (path.length === 0) {
        return { ...obj, [key]: value };
      }

      const [first, ...rest] = path;
      return {
        ...obj,
        [first]: updateNestedObject(obj[first], rest, value)
      };
    };

    const updated = updateNestedObject(translations, currentPath, newValue);
    onTranslationsChange(updated);
  };

  const handleAddKey = () => {
    const newKey = prompt('Entrez la nouvelle clé:');
    if (!newKey) return;

    const updateNestedObject = (obj, path) => {
      if (path.length === 0) {
        return { ...obj, [newKey]: '' };
      }

      const [first, ...rest] = path;
      return {
        ...obj,
        [first]: updateNestedObject(obj[first], rest)
      };
    };

    const updated = updateNestedObject(translations, currentPath);
    onTranslationsChange(updated);
  };

  const handleAddSection = () => {
    const newSection = prompt('Entrez le nom de la nouvelle section:');
    if (!newSection) return;

    const updateNestedObject = (obj, path) => {
      if (path.length === 0) {
        return { ...obj, [newSection]: {} };
      }

      const [first, ...rest] = path;
      return {
        ...obj,
        [first]: updateNestedObject(obj[first], rest)
      };
    };

    const updated = updateNestedObject(translations, currentPath);
    onTranslationsChange(updated);
  };

  const handleDeleteKey = (key) => {
    if (!window.confirm(`Supprimer la clé "${key}" ?`)) return;

    const updateNestedObject = (obj, path) => {
      if (path.length === 0) {
        // eslint-disable-next-line no-unused-vars
        const { [key]: deleted, ...rest } = obj;
        return rest;
      }

      const [first, ...restPath] = path;
      return {
        ...obj,
        [first]: updateNestedObject(obj[first], restPath)
      };
    };

    const updated = updateNestedObject(translations, currentPath);
    onTranslationsChange(updated);
  };

  const toggleExpand = (key) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const getKeyStats = () => {
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
    return countKeys(translations);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header with breadcrumbs and stats */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Breadcrumbs>
            <Chip
              label="Root"
              onClick={() => setCurrentPath([])}
              sx={{ cursor: 'pointer' }}
              color={currentPath.length === 0 ? 'primary' : 'default'}
            />
            {currentPath.map((key, index) => (
              <Chip
                key={key}
                label={key}
                onClick={() => handleBreadcrumbClick(index + 1)}
                sx={{ cursor: 'pointer' }}
                color={index === currentPath.length - 1 ? 'primary' : 'default'}
              />
            ))}
          </Breadcrumbs>

          <Stack direction="row" spacing={1}>
            <Chip
              icon={<Iconify icon="eva:file-text-fill" width={16} />}
              label={`${getKeyStats()} clés`}
              size="small"
              color="info"
            />
            {languageCode && (
              <Chip
                label={languageCode.toUpperCase()}
                size="small"
                color="primary"
              />
            )}
          </Stack>
        </Stack>

        {/* Search and actions */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher une clé ou une valeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleAddKey}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Ajouter clé
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="eva:folder-add-fill" />}
              onClick={handleAddSection}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Ajouter section
            </Button>
          </Stack>
        </Stack>

        {/* Translation items */}
        <Stack spacing={1.5}>
          {filteredKeys.map((key) => {
            const value = currentObject[key];
            const isObject = typeof value === 'object' && value !== null;
            const isExpanded = expandedKeys.has(key);

            return (
              <Box
                key={key}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  bgcolor: isObject ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  transition: 'all 0.2s',
                }}
              >
                {isObject ? (
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => handleNavigate(key)}
                      >
                        <Iconify
                          icon="eva:folder-fill"
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {key}
                        </Typography>
                        <Chip
                          label={`${Object.keys(value).length} ${Object.keys(value).length > 1 ? 'items' : 'item'}`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Chip
                          icon={<Iconify icon={isExpanded ? "eva:arrow-up-fill" : "eva:arrow-down-fill"} width={16} />}
                          label={isExpanded ? "Réduire" : "Aperçu"}
                          size="small"
                          onClick={() => toggleExpand(key)}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip
                          icon={<Iconify icon="eva:trash-2-outline" width={16} />}
                          label="Supprimer"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteKey(key)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>
                    </Stack>

                    {isExpanded && (
                      <Box
                        sx={{
                          pl: 3,
                          borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Stack spacing={0.5}>
                          {Object.entries(value).slice(0, 5).map(([subKey, subValue]) => (
                            <Typography key={subKey} variant="caption" color="text.secondary">
                              • {subKey}: {typeof subValue === 'string' ? `"${subValue}"` : '{...}'}
                            </Typography>
                          ))}
                          {Object.keys(value).length > 5 && (
                            <Typography variant="caption" color="text.disabled">
                              ... et {Object.keys(value).length - 5} de plus
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {key}
                      </Typography>
                      <Chip
                        icon={<Iconify icon="eva:trash-2-outline" width={16} />}
                        label="Supprimer"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteKey(key)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={value && value.length > 50 ? 3 : 1}
                      value={value || ''}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      placeholder="Entrez la traduction..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Stack>
                )}
              </Box>
            );
          })}

          {filteredKeys.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify
                icon="eva:search-outline"
                sx={{ width: 64, height: 64, mb: 2, opacity: 0.3 }}
              />
              <Typography variant="body2">
                {searchQuery ? 'Aucun résultat trouvé' : 'Section vide'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

TranslationEditor.propTypes = {
  translations: PropTypes.object.isRequired,
  onTranslationsChange: PropTypes.func.isRequired,
  languageCode: PropTypes.string,
};
