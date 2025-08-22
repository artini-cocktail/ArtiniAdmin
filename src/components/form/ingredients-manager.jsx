import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// Common ingredients for autocomplete
const COMMON_INGREDIENTS = [
  'Vodka', 'Gin', 'Rhum blanc', 'Rhum ambré', 'Whisky', 'Bourbon', 'Tequila', 'Cointreau',
  'Triple sec', 'Liqueur de café', 'Jus de citron', 'Jus de citron vert', 'Jus d\'orange',
  'Sirop de sucre', 'Sirop de grenadine', 'Angostura', 'Eau gazeuse', 'Tonic', 'Ginger beer',
  'Menthe fraîche', 'Basilic', 'Concombre', 'Citron', 'Orange', 'Cranberries'
];

const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'cl', label: 'cl' },
  { value: 'oz', label: 'oz' },
  { value: 'part', label: 'part' },
];

const SINGULAR_UNITS = [
  { value: 'drop', label: 'goutte' },
  { value: 'leaf', label: 'feuille' },
  { value: 'wedge', label: 'quartier' },
  { value: 'piece', label: 'pièce' },
  { value: 'spoon', label: 'cuillère' },
  { value: 'cube', label: 'cube' },
  { value: 'slice', label: 'tranche' },
  { value: 'half', label: 'moitié' },
];

const PLURAL_UNITS = [
  { value: 'drops', label: 'gouttes' },
  { value: 'leaves', label: 'feuilles' },
  { value: 'wedges', label: 'quartiers' },
  { value: 'pieces', label: 'pièces' },
  { value: 'spoons', label: 'cuillères' },
  { value: 'cubes', label: 'cubes' },
  { value: 'slices', label: 'tranches' },
  { value: 'halves', label: 'moitiés' },
];

export default function IngredientsManager({ ingredients = [], onChange, ...other }) {
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    onChange(updatedIngredients);
  };

  const handleAddIngredient = () => {
    const newIngredient = { value: 0, unit: 'ml', text: '' };
    onChange([...ingredients, newIngredient]);
    setExpandedIndex(ingredients.length);
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    onChange(updatedIngredients);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const getAvailableUnits = (quantity) => {
    const baseUnits = [...UNITS];
    const specialUnits = quantity <= 1 ? SINGULAR_UNITS : PLURAL_UNITS;
    return [...baseUnits, ...specialUnits];
  };

  return (
    <Box {...other}>
      <Stack spacing={2}>
        <AnimatePresence>
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Quantité"
                      value={ingredient.value}
                      onChange={(e) => handleIngredientChange(index, 'value', parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0, step: 0.1 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Autocomplete
                      size="small"
                      value={getAvailableUnits(ingredient.value).find(unit => unit.value === ingredient.unit) || null}
                      onChange={(event, newValue) => {
                        handleIngredientChange(index, 'unit', newValue?.value || 'ml');
                      }}
                      options={getAvailableUnits(ingredient.value)}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Unité"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={7}>
                    <Autocomplete
                      size="small"
                      freeSolo
                      value={ingredient.text}
                      onChange={(event, newValue) => {
                        handleIngredientChange(index, 'text', newValue || '');
                      }}
                      onInputChange={(event, newInputValue) => {
                        handleIngredientChange(index, 'text', newInputValue);
                      }}
                      options={COMMON_INGREDIENTS}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ingrédient"
                          placeholder="Ex: Vodka, Jus de citron..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={1}>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveIngredient(index)}
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.2),
                          },
                        }}
                      >
                        <Iconify icon="eva:trash-2-fill" />
                      </IconButton>
                    </motion.div>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddIngredient}
            sx={{
              borderRadius: 2,
              borderStyle: 'dashed',
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderStyle: 'dashed',
              },
            }}
            fullWidth
          >
            Ajouter un ingrédient
          </Button>
        </motion.div>

        {ingredients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                px: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
              }}
            >
              <Iconify
                icon="eva:shopping-cart-outline"
                sx={{
                  width: 48,
                  height: 48,
                  color: 'text.disabled',
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Aucun ingrédient ajouté pour le moment
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Cliquez sur &ldquo;Ajouter un ingrédient&rdquo; pour commencer
              </Typography>
            </Box>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
}

IngredientsManager.propTypes = {
  ingredients: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};