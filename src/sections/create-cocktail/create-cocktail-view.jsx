import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';
import { db, storage } from 'src/services/firebase';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { cocktailValidationSchema } from 'src/components/form/validation-schema';
import { FormSection, StepsManager, ImageUploadZone, IngredientsManager } from 'src/components/form';

// ----------------------------------------------------------------------

export default function CreateCocktailView() {
  const theme = useTheme();
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const glassList = [
    "Martini", "Rock", "Flute", "Tiki", "Beer", "Champagne", 
    "Old fashioned", "Highball", "Hurricane", "Shooter", 
    "Margarita", "Pilsner", "Balloon"
  ];

  const degreeOptions = [
    { value: 'Mocktail', label: 'Sans alcool', color: 'success' },
    { value: 'Weak', label: 'Léger', color: 'info' },
    { value: 'Medium', label: 'Moyen', color: 'warning' },
    { value: 'Strong', label: 'Fort', color: 'error' },
  ];

  const iceOptions = [
    { value: 'Without', label: 'Sans glaçons', icon: 'eva:close-circle-outline' },
    { value: 'Crushed', label: 'Pilé', icon: 'eva:cube-outline' },
    { value: 'Cube', label: 'Cubes', icon: 'eva:stop-circle-outline' },
  ];

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(cocktailValidationSchema),
    defaultValues: {
      name: "",
      creator: "",
      type: "Classic",
      glass: "Martini",
      degree: "Mocktail",
      ice: "Without",
      ingredients: [{
        id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        value: 0,
        unit: "ml",
        text: ""
      }],
      steps: [{
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ""
      }],
      description: "",
      photo: "",
      Validated: false,
      publisher: "r119v4QX3eMfWIhHRsesPp53t7X2",
      views: 0,
      likes: 0,
    }
  });

  const watchedValues = watch();


  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const cocktailData = {
        ...data,
        Validated: true,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
        publisher: "r119v4QX3eMfWIhHRsesPp53t7X2"
      };

      await addDoc(collection(db, "cocktails"), cocktailData);
      
      toast.success('🍸 Cocktail créé avec succès!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      router.push("/");
    } catch (error) {
      console.error('Error creating cocktail:', error);
      toast.error('Erreur lors de la création du cocktail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Erreur lors du téléchargement de l\'image');
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setValue('photo', downloadURL);
          setIsUploading(false);
          setUploadProgress(100);
          toast.success('Image téléchargée avec succès!');
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement');
      setIsUploading(false);
    }
  };


  const renderForm = (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Stack spacing={4}>
        {/* Image Upload Section */}
        <FormSection 
          title="Photo du cocktail" 
          icon={<Iconify icon="eva:camera-fill" />}
          delay={0.1}
        >
          <Controller
            name="photo"
            control={control}
            render={({ field }) => (
              <ImageUploadZone
                value={field.value}
                onChange={(file) => {
                  if (file) {
                    handleFileUpload(file);
                  } else {
                    field.onChange('');
                  }
                }}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                error={errors.photo?.message}
              />
            )}
          />
          {errors.photo && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.photo.message}
            </Typography>
          )}
        </FormSection>

        {/* Basic Information */}
        <FormSection 
          title="Informations générales" 
          icon={<Iconify icon="eva:edit-fill" />}
          delay={0.2}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nom du cocktail"
                    placeholder="Ex: Mojito, Cosmopolitan..."
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Type de cocktail
              </Typography>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    {...field}
                    exclusive
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                      },
                    }}
                  >
                    <ToggleButton value="Classic">
                      <Iconify icon="eva:star-fill" sx={{ mr: 1 }} />
                      Classique
                    </ToggleButton>
                    <ToggleButton value="Original">
                      <Iconify icon="eva:bulb-fill" sx={{ mr: 1 }} />
                      Original
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Grid>
            
            {watchedValues.type === 'Original' && (
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Controller
                    name="creator"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Créateur"
                        placeholder="Nom du créateur"
                        error={!!errors.creator}
                        helperText={errors.creator?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setValue('creator', '')}>
                                <Iconify icon="eva:person-add-fill" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                </motion.div>
              </Grid>
            )}
          </Grid>
        </FormSection>

        {/* Cocktail Properties */}
        <FormSection 
          title="Caractéristiques" 
          icon={<Iconify icon="eva:settings-fill" />}
          delay={0.3}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Controller
                name="glass"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={[...glassList, 'Autre']}
                    freeSolo
                    onChange={(event, newValue) => field.onChange(newValue || '')}
                    onInputChange={(event, newInputValue) => field.onChange(newInputValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type de verre"
                        error={!!errors.glass}
                        helperText={errors.glass?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Degré d&apos;alcool
              </Typography>
              <Controller
                name="degree"
                control={control}
                render={({ field }) => (
                  <Stack spacing={1}>
                    {degreeOptions.map((option) => (
                      <Box
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${
                            field.value === option.value 
                              ? theme.palette[option.color].main 
                              : alpha(theme.palette.grey[500], 0.2)
                          }`,
                          bgcolor: field.value === option.value 
                            ? alpha(theme.palette[option.color].main, 0.1) 
                            : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: alpha(theme.palette[option.color].main, 0.05),
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            size="small"
                            color={option.color}
                            variant={field.value === option.value ? 'filled' : 'outlined'}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {option.label}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Glaçons
              </Typography>
              <Controller
                name="ice"
                control={control}
                render={({ field }) => (
                  <Stack spacing={1}>
                    {iceOptions.map((option) => (
                      <Box
                        key={option.value}
                        onClick={() => field.onChange(option.value)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${
                            field.value === option.value 
                              ? theme.palette.primary.main 
                              : alpha(theme.palette.grey[500], 0.2)
                          }`,
                          bgcolor: field.value === option.value 
                            ? alpha(theme.palette.primary.main, 0.1) 
                            : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Iconify icon={option.icon} />
                          <Typography variant="body2" fontWeight={600}>
                            {option.label}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              />
            </Grid>
          </Grid>
        </FormSection>

        {/* Ingredients */}
        <FormSection 
          title="Ingrédients" 
          icon={<Iconify icon="eva:shopping-cart-fill" />}
          delay={0.4}
        >
          <Controller
            name="ingredients"
            control={control}
            render={({ field }) => (
              <IngredientsManager
                ingredients={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.ingredients && (
            <Typography variant="caption" color="error">
              {errors.ingredients.message}
            </Typography>
          )}
        </FormSection>

        {/* Steps */}
        <FormSection 
          title="Préparation" 
          icon={<Iconify icon="eva:list-fill" />}
          delay={0.5}
        >
          <Controller
            name="steps"
            control={control}
            render={({ field }) => (
              <StepsManager
                steps={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.steps && (
            <Typography variant="caption" color="error">
              {errors.steps.message}
            </Typography>
          )}
        </FormSection>

        {/* Description */}
        <FormSection 
          title="Description" 
          icon={<Iconify icon="eva:file-text-fill" />}
          delay={0.6}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Description du cocktail"
                placeholder="Décrivez votre cocktail, son histoire, ses saveurs..."
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </FormSection>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: theme.shadows[8],
              '&:hover': {
                boxShadow: theme.shadows[12],
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le cocktail'}
          </LoadingButton>
        </motion.div>
      </Stack>
    </motion.form>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 1, py: 4 }}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 1200 }}
        >
          <Card
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              boxShadow: theme.shadows[16],
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Création de cocktail
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Créez et partagez vos recettes de cocktails
                </Typography>
              </motion.div>
            </Box>
            {renderForm}
          </Card>
        </motion.div>
      </Stack>
    </Box>
  );
}
