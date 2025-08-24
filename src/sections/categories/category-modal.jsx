import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { storage } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const colorOptions = [
  { code: '', colors: ['transparent', 'transparent'], label: 'Aucune couleur', isDefault: true },
  { code: 'Red&White', colors: ['#f44336', '#ffffff'], label: 'Rouge & Blanc' },
  { code: 'Blue&White', colors: ['#2196f3', '#ffffff'], label: 'Bleu & Blanc' },
  { code: 'Green&White', colors: ['#4caf50', '#ffffff'], label: 'Vert & Blanc' },
  { code: 'Orange&White', colors: ['#ff9800', '#ffffff'], label: 'Orange & Blanc' },
  { code: 'Purple&White', colors: ['#9c27b0', '#ffffff'], label: 'Violet & Blanc' },
  { code: 'Red&Black', colors: ['#f44336', '#000000'], label: 'Rouge & Noir' },
  { code: 'Blue&Black', colors: ['#2196f3', '#000000'], label: 'Bleu & Noir' },
  { code: 'Green&Black', colors: ['#4caf50', '#000000'], label: 'Vert & Noir' },
];

export default function CategoryModal({ open, onClose, onSave, category, isEditing, existingOrders = [], allCategories = [] }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    colorCode: '',
    displayOrder: 1,
    visible: true,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (category && isEditing) {
      setFormData({
        title: category.title || '',
        colorCode: category.colorCode || '',
        displayOrder: category.displayOrder || 1,
        visible: category.visible !== undefined ? category.visible : true,
        imageUrl: category.imageUrl || '',
      });
    } else {
      // For new categories, suggest next available order
      const maxOrder = Math.max(...existingOrders, 0);
      setFormData({
        title: '',
        colorCode: '',
        displayOrder: maxOrder + 1,
        visible: true,
        imageUrl: '',
      });
    }
  }, [category, isEditing, existingOrders]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const uploadImage = async (file) => new Promise((resolve, reject) => {
      const fileName = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `category/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });

  const handleSubmit = async () => {
    setLoading(true);
    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        ...formData,
        imageUrl: finalImageUrl,
        displayOrder: Number(formData.displayOrder),
      };

      await onSave(categoryData);
      setImageFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return false;
    if (formData.displayOrder < 1) return false;
    if (!isEditing && existingOrders.includes(Number(formData.displayOrder))) return false;
    return true;
  };

  const selectedColorOption = colorOptions.find(option => option.code === formData.colorCode) || colorOptions[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Left Column - Form */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Title */}
              <TextField
                fullWidth
                label="Nom de la catégorie"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Ex: Christmas, Summer Cocktails..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Display Order */}
              <Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Ordre d'affichage"
                  value={formData.displayOrder}
                  onChange={handleInputChange('displayOrder')}
                  inputProps={{ min: 1, max: 999 }}
                  helperText={
                    !isEditing && existingOrders.includes(Number(formData.displayOrder))
                      ? "Cet ordre est déjà utilisé"
                      : "Position de la catégorie dans l'application (1, 2, 3...)"
                  }
                  error={!isEditing && existingOrders.includes(Number(formData.displayOrder))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                
                {/* Show which categories will be affected */}
                {isEditing && formData.displayOrder !== category?.displayOrder && (
                  <Alert 
                    severity="info" 
                    sx={{ mt: 2 }}
                    icon={<Iconify icon="eva:swap-outline" />}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Réorganisation prévue :
                    </Typography>
                    {(() => {
                      const oldOrder = category?.displayOrder;
                      const newOrder = Number(formData.displayOrder);
                      const affectedCategories = allCategories
                        .filter(cat => {
                          if (cat.id === category?.id) return false;
                          if (newOrder < oldOrder) {
                            return cat.displayOrder >= newOrder && cat.displayOrder < oldOrder;
                          }
                          return cat.displayOrder > oldOrder && cat.displayOrder <= newOrder;
                        })
                        .sort((a, b) => a.displayOrder - b.displayOrder);

                      if (affectedCategories.length === 0) {
                        return (
                          <Typography variant="caption" color="text.secondary">
                            Déplacement vers la position {newOrder} (actuellement libre)
                          </Typography>
                        );
                      }

                      return (
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            {newOrder < oldOrder ? 
                              `Les catégories suivantes seront décalées vers le bas :` :
                              `Les catégories suivantes seront décalées vers le haut :`
                            }
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {affectedCategories.map(cat => (
                              <Chip
                                key={cat.id}
                                label={`${cat.title} (#${cat.displayOrder} → #${
                                  newOrder < oldOrder ? cat.displayOrder + 1 : cat.displayOrder - 1
                                })`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Stack>
                      );
                    })()}
                  </Alert>
                )}

                {/* Show which category currently has this position */}
                {!isEditing && formData.displayOrder && (
                  (() => {
                    const existingCategory = allCategories.find(
                      cat => cat.displayOrder === Number(formData.displayOrder)
                    );
                    if (existingCategory) {
                      return (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            La catégorie <strong>{existingCategory.title}</strong> occupe actuellement la position #{formData.displayOrder}.
                            Elle sera automatiquement décalée.
                          </Typography>
                        </Alert>
                      );
                    }
                    return null;
                  })()
                )}
              </Box>

              {/* Color Code */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Couleurs de la catégorie (optionnel)
                </Typography>
                <Grid container spacing={1}>
                  {colorOptions.map((option) => (
                    <Grid key={option.code || 'none'} item xs={6} sm={4}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Card
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            border: `2px solid ${
                              formData.colorCode === option.code
                                ? theme.palette.primary.main
                                : 'transparent'
                            }`,
                            '&:hover': {
                              boxShadow: theme.shadows[8],
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                          onClick={() => setFormData(prev => ({ ...prev, colorCode: option.code }))}
                        >
                          <Stack alignItems="center" spacing={1}>
                            {option.isDefault ? (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 20,
                                  borderRadius: 1,
                                  border: `2px dashed ${alpha(theme.palette.grey[500], 0.5)}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Iconify icon="eva:close-outline" width={16} color={theme.palette.grey[500]} />
                              </Box>
                            ) : (
                              <Stack direction="row" spacing={0.5}>
                                {option.colors.map((color, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: '50%',
                                      bgcolor: color,
                                      border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
                                    }}
                                  />
                                ))}
                              </Stack>
                            )}
                            <Typography variant="caption" textAlign="center" sx={{ fontSize: '0.7rem' }}>
                              {option.label}
                            </Typography>
                          </Stack>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Visibility */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.visible}
                    onChange={handleInputChange('visible')}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.visible ? 'Catégorie visible' : 'Catégorie masquée'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.visible 
                        ? 'La catégorie sera visible dans l\'application'
                        : 'La catégorie sera masquée aux utilisateurs'
                      }
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Grid>

          {/* Right Column - Image */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Image de la catégorie
              </Typography>

              {/* Image Upload/Preview */}
              <Card
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `2px dashed ${alpha(theme.palette.grey[500], 0.32)}`,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                onClick={() => document.getElementById('category-image-input').click()}
              >
                <input
                  id="category-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                {formData.imageUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: alpha(theme.palette.error.main, 0.9),
                        color: 'white',
                        '&:hover': {
                          bgcolor: theme.palette.error.dark,
                        },
                      }}
                    >
                      <Iconify icon="eva:close-fill" width={20} />
                    </IconButton>
                  </Box>
                ) : (
                  <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: selectedColorOption.isDefault 
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                          : `linear-gradient(135deg, ${selectedColorOption.colors[0]} 0%, ${selectedColorOption.colors[1]} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                        {formData.title?.charAt(0)?.toUpperCase() || 'C'}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Ajouter une image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cliquez pour sélectionner une image
                    </Typography>
                  </Stack>
                )}
              </Card>

              {/* Upload Progress */}
              {isUploading && uploadProgress > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Upload en cours... {Math.round(uploadProgress)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1 }} />
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Annuler
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit}
            loading={loading}
            disabled={!validateForm()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            {isEditing ? 'Mettre à jour' : 'Créer la catégorie'}
          </LoadingButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

CategoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  category: PropTypes.object,
  isEditing: PropTypes.bool.isRequired,
  existingOrders: PropTypes.arrayOf(PropTypes.number),
  allCategories: PropTypes.arrayOf(PropTypes.object),
};