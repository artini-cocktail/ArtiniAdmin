import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CategoryCard({ category, onEdit, onDelete, onManageCocktails }) {
  const theme = useTheme();

  const { title, imageUrl, colorCode, displayOrder, visible } = category;

  const parseColorCode = (code) => {
    if (!code) return [theme.palette.primary.main, theme.palette.secondary.main];
    const colors = code.split('&').map(color => {
      switch (color.toLowerCase()) {
        case 'red': return theme.palette.error.main;
        case 'green': return theme.palette.success.main;
        case 'blue': return theme.palette.info.main;
        case 'orange': return theme.palette.warning.main;
        case 'purple': return theme.palette.secondary.main;
        case 'white': return '#ffffff';
        case 'black': return '#000000';
        default: return theme.palette.primary.main;
      }
    });
    return colors.length >= 2 ? colors : [colors[0] || theme.palette.primary.main, theme.palette.secondary.main];
  };

  const [color1, color2] = parseColorCode(colorCode);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: 100, // Hauteur fixe compacte
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(color1, 0.05)} 0%, ${alpha(color2, 0.05)} 100%)`,
          border: `1px solid ${alpha(color1, 0.1)}`,
          '&:hover': {
            boxShadow: theme.shadows[16],
            '& .category-actions': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          },
        }}
      >
        {/* Image à gauche */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={title}
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 2,
                ml: 2,
                filter: !visible ? 'grayscale(50%)' : 'none',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 60,
                height: 60,
                ml: 2,
                borderRadius: 2,
                background: colorCode 
                  ? `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}
              >
                {title?.charAt(0)?.toUpperCase() || 'C'}
              </Typography>
            </Box>
          )}
          
          {/* Indicateur d'ordre en overlay */}
          <Chip
            label={`#${displayOrder}`}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              left: 8,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              fontSize: '0.7rem',
              height: 20,
              minWidth: 32,
            }}
          />
        </Box>

        {/* Contenu principal */}
        <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
          <Stack spacing={1} sx={{ height: '100%', justifyContent: 'center' }}>
            {/* Titre */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: !visible ? 'text.secondary' : 'text.primary',
                textDecoration: !visible ? 'line-through' : 'none',
                fontSize: '1.1rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>

            {/* Couleurs et statut */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Couleurs - seulement si colorCode existe */}
              {colorCode && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: color1,
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: color2,
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {colorCode}
                  </Typography>
                </Stack>
              )}
              
              {/* Statut de visibilité */}
              <Chip
                icon={<Iconify icon={visible ? 'eva:eye-fill' : 'eva:eye-off-fill'} width={12} />}
                label={visible ? 'Visible' : 'Masqué'}
                size="small"
                color={visible ? 'success' : 'default'}
                variant={visible ? 'filled' : 'outlined'}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Actions à droite */}
        <Box sx={{ flexShrink: 0, pr: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            className="category-actions"
            sx={{
              opacity: 0.7,
              transform: 'translateX(10px)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <IconButton
              size="small"
              onClick={onManageCocktails}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                },
              }}
            >
              <Iconify icon="eva:list-fill" width={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                },
              }}
            >
              <Iconify icon="eva:edit-fill" width={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: 'error.main',
                },
              }}
            >
              <Iconify icon="eva:trash-2-fill" width={16} />
            </IconButton>
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onManageCocktails: PropTypes.func,
};