import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

export default function StepsManager({ steps = [], onChange, ...other }) {
  const theme = useTheme();

  const handleStepChange = (index, value) => {
    const updatedSteps = steps.map((step, i) =>
      i === index ? { ...step, text: value } : step
    );
    onChange(updatedSteps);
  };

  const handleAddStep = () => {
    const newStep = { text: '' };
    onChange([...steps, newStep]);
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    onChange(updatedSteps);
  };

  const handleMoveStep = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= steps.length) return;
    
    const updatedSteps = [...steps];
    const [movedStep] = updatedSteps.splice(fromIndex, 1);
    updatedSteps.splice(toIndex, 0, movedStep);
    onChange(updatedSteps);
  };

  return (
    <Box {...other}>
      <Stack spacing={2}>
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <Box
                sx={{
                  position: 'relative',
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    '& .step-actions': {
                      opacity: 1,
                    },
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: theme.shadows[2],
                  }}
                >
                  {index + 1}
                </Box>

                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Étape ${index + 1}`}
                    placeholder="Décrivez cette étape de préparation..."
                    value={step.text}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      },
                    }}
                  />

                  <Stack 
                    className="step-actions"
                    spacing={0.5} 
                    sx={{ 
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease-in-out',
                      mt: 1,
                    }}
                  >
                    {/* Move Up */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => handleMoveStep(index, index - 1)}
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                          },
                          '&:disabled': {
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                          },
                        }}
                      >
                        <Iconify icon="eva:arrow-up-fill" width={16} />
                      </IconButton>
                    </motion.div>

                    {/* Move Down */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        size="small"
                        disabled={index === steps.length - 1}
                        onClick={() => handleMoveStep(index, index + 1)}
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                          },
                          '&:disabled': {
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                          },
                        }}
                      >
                        <Iconify icon="eva:arrow-down-fill" width={16} />
                      </IconButton>
                    </motion.div>

                    {/* Delete */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveStep(index)}
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.2),
                          },
                        }}
                      >
                        <Iconify icon="eva:trash-2-fill" width={16} />
                      </IconButton>
                    </motion.div>
                  </Stack>
                </Stack>
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
            onClick={handleAddStep}
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
            Ajouter une étape
          </Button>
        </motion.div>

        {steps.length === 0 && (
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
                icon="eva:list-outline"
                sx={{
                  width: 48,
                  height: 48,
                  color: 'text.disabled',
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Aucune étape de préparation définie
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Ajoutez les étapes de préparation de votre cocktail
              </Typography>
            </Box>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
}

StepsManager.propTypes = {
  steps: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};