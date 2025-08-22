import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CocktailDetailModal({
  open,
  onClose,
  cocktail,
  publisherName,
  onApprove,
  onReject,
}) {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  if (!cocktail) return null;

  // Extract cocktail properties
  const name = cocktail?.name || 'Cocktail sans nom';
  const category = cocktail?.category || 'Non catégorisé';
  const degree = cocktail?.degree || 'Non spécifié';
  const ice = cocktail?.ice || 'Non spécifié';
  const image = cocktail?.photo;
  const ingredients = cocktail?.ingredients || [];
  const steps = cocktail?.steps || [];
  const description = cocktail?.description;
  const createdAt = cocktail?.createdAt;
  const validated = cocktail?.Validated === true;
  const rejected = cocktail?.rejected === true;
  const views = cocktail?.views || 0;
  const likes = cocktail?.likes || 0;

  // Get status info
  const getStatus = () => {
    if (validated) {
      return { color: 'success', label: 'Approuvé', icon: 'eva:checkmark-circle-2-fill' };
    }
    if (rejected) {
      return { color: 'error', label: 'Rejeté', icon: 'eva:close-circle-fill' };
    }
    return { color: 'warning', label: 'En attente', icon: 'eva:clock-fill' };
  };

  const status = getStatus();

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      if (date.toDate) return date.toDate().toLocaleDateString('fr-FR');
      if (date instanceof Date) return date.toLocaleDateString('fr-FR');
      if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      return null;
    }
  };

  const handleApprove = () => {
    onApprove();
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
              Détails du cocktail
            </Typography>
            <Chip
              size="small"
              label={status.label}
              color={status.color}
              icon={<Iconify icon={status.icon} width={16} />}
            />
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ height: 400, position: 'relative', mb: 3 }}>
          {/* Cocktail Image */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.grey[500], 0.12),
            }}
          >
            {image && !imageError ? (
              <Avatar
                alt={name}
                src={image}
                variant="square"
                onError={() => setImageError(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <Iconify
                  icon="fluent:drink-cocktail-24-filled"
                  width={120}
                  sx={{ color: 'primary.main', opacity: 0.48 }}
                />
              </Box>
            )}
          </Box>

          {/* Overlay info */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              bgcolor: alpha(theme.palette.common.black, 0.6),
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              p: 2,
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {name}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:eye-fill" width={16} />
                <Typography variant="body2">{views} vues</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:heart-fill" width={16} />
                <Typography variant="body2">{likes} likes</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          {/* Basic Info Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Catégorie
                  </Typography>
                  <Typography variant="body1">{category}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body1">{degree}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Glace
                  </Typography>
                  <Typography variant="body1">{ice}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={2}>
                {publisherName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Créé par
                    </Typography>
                    <Typography variant="body1">{publisherName}</Typography>
                  </Box>
                )}
                {formatDate(createdAt) && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date de création
                    </Typography>
                    <Typography variant="body1">{formatDate(createdAt)}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Statistiques
                  </Typography>
                  <Typography variant="body1">
                    {views} vues • {likes} likes
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Description */}
          {description && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {description}
                </Typography>
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Ingredients */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingrédients ({ingredients.length})
            </Typography>
            <Stack spacing={1.5}>
              {ingredients.map((ingredient, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                >
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {ingredient.value}
                    </Box>
                    {' '}
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {ingredient.unit}
                    </Box>
                    {' '}
                    <Box component="span">
                      {ingredient.text}
                    </Box>
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Steps */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Préparation ({steps.length} étapes)
            </Typography>
            <Stack spacing={2}>
              {steps.map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="body1" sx={{ flex: 1, lineHeight: 1.8 }}>
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} color="inherit" size="large">
          Fermer
        </Button>
        {!validated && !rejected && (
          <>
            <Button
              onClick={handleReject}
              color="error"
              variant="outlined"
              size="large"
              startIcon={<Iconify icon="eva:close-circle-fill" />}
            >
              Rejeter
            </Button>
            <Button
              onClick={handleApprove}
              color="success"
              variant="contained"
              size="large"
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            >
              Approuver
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

CocktailDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cocktail: PropTypes.object,
  publisherName: PropTypes.string,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};