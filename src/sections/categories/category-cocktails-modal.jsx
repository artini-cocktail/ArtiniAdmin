import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { doc, query, where, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { db } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

import SortableCocktailItem from './sortable-cocktail-item';

// ----------------------------------------------------------------------

export default function CategoryCocktailsModal({ open, onClose, category }) {
  const theme = useTheme();
  const [cocktails, setCocktails] = useState([]); // Tous les cocktails disponibles
  const [categoryCocktails, setCategoryCocktails] = useState([]); // Cocktails de la catégorie
  const [tempCocktailIds, setTempCocktailIds] = useState([]); // IDs temporaires pour drag & drop
  const [availableCocktails, setAvailableCocktails] = useState([]); // Cocktails disponibles à ajouter
  const [selectedCocktail, setSelectedCocktail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Charger tous les cocktails
  useEffect(() => {
    if (!open) return undefined;

    const q = query(collection(db, 'cocktails'), where('Validated', '==', true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cocktailsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setCocktails(cocktailsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [open]);

  // Initialiser les données de la catégorie
  useEffect(() => {
    if (!category || !cocktails.length) return;

    const categoryIds = category.cocktails || [];
    setTempCocktailIds(categoryIds);
    
    // Récupérer les cocktails de la catégorie dans l'ordre
    const orderedCocktails = categoryIds
      .map(id => cocktails.find(cocktail => cocktail.id === id))
      .filter(Boolean);
    setCategoryCocktails(orderedCocktails);

    // Cocktails disponibles (non dans la catégorie)
    const available = cocktails.filter(cocktail => !categoryIds.includes(cocktail.id));
    setAvailableCocktails(available);
    
    setHasChanges(false);
  }, [category, cocktails]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tempCocktailIds.indexOf(active.id);
    const newIndex = tempCocktailIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(tempCocktailIds, oldIndex, newIndex);
      setTempCocktailIds(newOrder);
      
      // Réorganiser les cocktails affichés
      const reorderedCocktails = arrayMove(categoryCocktails, oldIndex, newIndex);
      setCategoryCocktails(reorderedCocktails);
      
      setHasChanges(true);
    }
  };

  const handleAddCocktail = (cocktail) => {
    if (!cocktail || tempCocktailIds.includes(cocktail.id)) return;

    const newIds = [...tempCocktailIds, cocktail.id];
    const newCocktails = [...categoryCocktails, cocktail];
    
    setTempCocktailIds(newIds);
    setCategoryCocktails(newCocktails);
    setAvailableCocktails(prev => prev.filter(c => c.id !== cocktail.id));
    setSelectedCocktail(null);
    setHasChanges(true);
  };

  const handleRemoveCocktail = (cocktailId) => {
    const cocktailToRemove = categoryCocktails.find(c => c.id === cocktailId);
    if (!cocktailToRemove) return;

    const newIds = tempCocktailIds.filter(id => id !== cocktailId);
    const newCocktails = categoryCocktails.filter(c => c.id !== cocktailId);
    
    setTempCocktailIds(newIds);
    setCategoryCocktails(newCocktails);
    setAvailableCocktails(prev => [...prev, cocktailToRemove].sort((a, b) => a.name.localeCompare(b.name)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!category) return;
    
    setSaving(true);
    try {
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, {
        cocktails: tempCocktailIds,
        updatedAt: new Date()
      });
      
      setHasChanges(false);
      toast.success('Cocktails de la catégorie mis à jour');
     
    } catch (error) {
      console.error('Error updating category cocktails:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
       onClose();
    }
  };

  const handleCancel = () => {
    if (!category) return;
    
    const originalIds = category.cocktails || [];
    setTempCocktailIds(originalIds);
    
    const orderedCocktails = originalIds
      .map(id => cocktails.find(cocktail => cocktail.id === id))
      .filter(Boolean);
    setCategoryCocktails(orderedCocktails);
    
    const available = cocktails.filter(cocktail => !originalIds.includes(cocktail.id));
    setAvailableCocktails(available);
    
    setHasChanges(false);
  };

  const activeCocktail = activeId ? categoryCocktails.find(c => c.id === activeId) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: 600,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Cocktails - {category?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoryCocktails.length} cocktail(s) • Glissez-déposez pour réorganiser
            </Typography>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Ajouter un cocktail */}
          <Card sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <Iconify icon="eva:plus-circle-fill" sx={{ mr: 1 }} />
                Ajouter un cocktail
              </Typography>
              
              <Autocomplete
                options={availableCocktails}
                getOptionLabel={(option) => option.name || 'Sans nom'}
                value={selectedCocktail}
                onChange={(event, newValue) => setSelectedCocktail(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher un cocktail"
                    placeholder="Tapez le nom d'un cocktail..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <Avatar
                      src={option.photo}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {option.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.type} • {option.degree}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => handleAddCocktail(selectedCocktail)}
                disabled={!selectedCocktail}
                sx={{ alignSelf: 'flex-start' }}
              >
                Ajouter à la catégorie
              </Button>
            </Stack>
          </Card>

          {/* Liste des cocktails */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <Iconify icon="eva:list-fill" sx={{ mr: 1 }} />
              Cocktails dans la catégorie
            </Typography>

            {loading && (
              <Stack spacing={1}>
                {[...Array(3)].map((_, index) => (
                  <Card key={index} sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 48, height: 48, bgcolor: 'grey.200', borderRadius: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                        <Box sx={{ height: 12, bgcolor: 'grey.100', borderRadius: 1, width: '60%' }} />
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
            
            {!loading && categoryCocktails.length === 0 && (
              <Card sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                <Iconify icon="eva:inbox-outline" width={48} sx={{ mb: 2, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Aucun cocktail dans cette catégorie
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Utilisez le formulaire ci-dessus pour ajouter des cocktails
                </Typography>
              </Card>
            )}
            
            {!loading && categoryCocktails.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoryCocktails.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1}>
                    {categoryCocktails.map((cocktail, index) => (
                      <SortableCocktailItem
                        key={cocktail.id}
                        cocktail={cocktail}
                        index={index + 1}
                        onRemove={() => handleRemoveCocktail(cocktail.id)}
                      />
                    ))}
                  </Stack>
                </SortableContext>
                
                <DragOverlay>
                  {activeCocktail && (
                    <Card sx={{ opacity: 0.8, rotate: '3deg', boxShadow: theme.shadows[16] }}>
                      <SortableCocktailItem
                        cocktail={activeCocktail}
                        index={categoryCocktails.findIndex(c => c.id === activeId) + 1}
                        onRemove={() => {}}
                        isDragging
                      />
                    </Card>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={saving || !hasChanges}
        >
          Annuler
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges}
          loadingText="Sauvegarde..."
        >
          Sauvegarder les changements
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

CategoryCocktailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
};