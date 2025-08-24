import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CategoryEmptyState({ onCreate }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack alignItems="center" spacing={3} sx={{ maxWidth: 400, textAlign: 'center' }}>
          {/* Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Iconify
                icon="eva:grid-outline"
                width={48}
                sx={{ 
                  color: theme.palette.primary.main,
                  opacity: 0.8,
                }}
              />
            </Box>
          </motion.div>

          {/* Text */}
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Aucune catégorie créée
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Créez votre première catégorie de cocktails pour organiser vos recettes.
              Vous pouvez définir des couleurs, un ordre d&apos;affichage et ajouter une image.
            </Typography>
          </Stack>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={onCreate}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                boxShadow: theme.shadows[8],
                '&:hover': {
                  boxShadow: theme.shadows[12],
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Créer ma première catégorie
            </Button>
          </motion.div>

          {/* Feature List */}
          <Stack spacing={1} sx={{ mt: 2, opacity: 0.7 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Ordre d&apos;affichage personnalisable
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Couleurs thématiques
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Images personnalisées
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );
}

CategoryEmptyState.propTypes = {
  onCreate: PropTypes.func.isRequired,
};