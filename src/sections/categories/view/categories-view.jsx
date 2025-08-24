import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { doc, query, addDoc, orderBy, updateDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
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
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { db } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

import CategoryCard from '../category-card';
import CategoryModal from '../category-modal';
import CategoryEmptyState from '../category-empty-state';
import SortableCategoryCard from '../sortable-category-card';
import { CategoryCardSkeleton } from '../category-card-skeleton';
import CategoryCocktailsModal from '../category-cocktails-modal';

// ----------------------------------------------------------------------

export default function CategoriesView() {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [tempCategories, setTempCategories] = useState([]); // État temporaire pour le drag & drop
  const [hasChanges, setHasChanges] = useState(false); // Indique si des changements sont en attente
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cocktailsModalOpen, setCocktailsModalOpen] = useState(false);
  const [selectedCategoryForCocktails, setSelectedCategoryForCocktails] = useState(null);

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

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const categoriesData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setCategories(categoriesData);
        
        // Ne synchroniser l'état temporaire que s'il n'y a pas de changements en cours
        if (!hasChanges) {
          setTempCategories(categoriesData);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        toast.error('Erreur lors du chargement des catégories');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [hasChanges]);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId, categoryTitle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryTitle}" ? Cette action est irréversible.`)) {
      try {
        const categoryRef = doc(db, 'categories', categoryId);
        await deleteDoc(categoryRef);
        
        // Réorganiser les ordres après suppression
        const remainingCategories = categories
          .filter(cat => cat.id !== categoryId)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        
        await updateCategoriesOrder(remainingCategories);
        toast.success('Catégorie supprimée avec succès');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const updateCategoriesOrder = async (updatedCategories) => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      
      updatedCategories.forEach((category, index) => {
        const newOrder = index + 1;
        if (category.displayOrder !== newOrder) {
          const categoryRef = doc(db, 'categories', category.id);
          batch.update(categoryRef, { 
            displayOrder: newOrder,
            updatedAt: new Date()
          });
        }
      });
      
      await batch.commit();
      toast.success('Ordre des catégories mis à jour');
    } catch (error) {
      console.error('Error updating categories order:', error);
      toast.error('Erreur lors de la mise à jour de l\'ordre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (isEditing && selectedCategory) {
        const oldOrder = selectedCategory.displayOrder;
        const newOrder = categoryData.displayOrder;
        
        // Si l'ordre a changé, réorganiser les autres catégories
        if (oldOrder !== newOrder) {
          const updatedCategories = [...categories];
          const categoryIndex = updatedCategories.findIndex(cat => cat.id === selectedCategory.id);
          
          // Retirer la catégorie de sa position actuelle
          updatedCategories.splice(categoryIndex, 1);
          
          // L'insérer à la nouvelle position
          updatedCategories.splice(newOrder - 1, 0, { ...selectedCategory, ...categoryData });
          
          // Mettre à jour tous les ordres
          const batch = writeBatch(db);
          updatedCategories.forEach((cat, index) => {
            const categoryRef = doc(db, 'categories', cat.id);
            batch.update(categoryRef, {
              ...cat,
              displayOrder: index + 1,
              updatedAt: new Date()
            });
          });
          
          await batch.commit();
          toast.success(`Catégorie déplacée à la position ${newOrder}`);
        } else {
          // Mise à jour simple sans changement d'ordre
          const categoryRef = doc(db, 'categories', selectedCategory.id);
          await updateDoc(categoryRef, {
            ...categoryData,
            updatedAt: new Date()
          });
          toast.success('Catégorie mise à jour avec succès');
        }
      } else {
        // Création d'une nouvelle catégorie
        const targetOrder = categoryData.displayOrder;
        
        // Décaler les catégories existantes si nécessaire
        const categoriesToUpdate = categories.filter(cat => cat.displayOrder >= targetOrder);
        
        if (categoriesToUpdate.length > 0) {
          const batch = writeBatch(db);
          
          // Décaler les catégories existantes
          categoriesToUpdate.forEach(cat => {
            const categoryRef = doc(db, 'categories', cat.id);
            batch.update(categoryRef, {
              displayOrder: cat.displayOrder + 1,
              updatedAt: new Date()
            });
          });
          
          await batch.commit();
        }
        
        // Créer la nouvelle catégorie
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        toast.success(`Catégorie créée à la position ${targetOrder}`);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setIsDragging(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    // Si pas de destination ou même élément, ne rien faire
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tempCategories.findIndex(cat => cat.id === active.id);
    const newIndex = tempCategories.findIndex(cat => cat.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reorderedCategories = arrayMove(tempCategories, oldIndex, newIndex);
      
      // Mise à jour temporaire locale seulement
      setTempCategories(reorderedCategories);
      setHasChanges(true);
    }
  };

  // Fonction pour sauvegarder les changements d'ordre
  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      await updateCategoriesOrder(tempCategories);
      setHasChanges(false);
      toast.success('Ordre des catégories sauvegardé');
    } catch (error) {
      console.error('Error saving order changes:', error);
      // En cas d'erreur, on remet l'état temporaire à l'état original
      setTempCategories(categories);
      setHasChanges(false);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour annuler les changements
  const handleCancelChanges = () => {
    setTempCategories(categories);
    setHasChanges(false);
  };

  const activeCategory = activeId ? tempCategories.find(cat => cat.id === activeId) : null;

  const handleManageCocktails = (category) => {
    setSelectedCategoryForCocktails(category);
    setCocktailsModalOpen(true);
  };

  const handleCloseCocktailsModal = () => {
    setCocktailsModalOpen(false);
    setSelectedCategoryForCocktails(null);
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Stack>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Gestion des catégories
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Glissez-déposez pour réorganiser • Cliquez pour éditer
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {isSaving && (
              <Chip
                icon={<Iconify icon="eva:sync-outline" width={16} />}
                label="Sauvegarde..."
                color="warning"
                variant="filled"
              />
            )}
            
            {/* Boutons de validation/annulation des changements d'ordre */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="eva:close-outline" />}
                    onClick={handleCancelChanges}
                    disabled={isSaving}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'error.main',
                      color: 'error.main',
                      '&:hover': {
                        borderColor: 'error.dark',
                        bgcolor: alpha(theme.palette.error.main, 0.04),
                      },
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="eva:checkmark-outline" />}
                    onClick={handleSaveOrder}
                    disabled={isSaving}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Valider l&apos;ordre
                  </Button>
                </Stack>
              </motion.div>
            )}
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleCreateCategory}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: theme.shadows[8],
                '&:hover': {
                  boxShadow: theme.shadows[12],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Nouvelle catégorie
            </Button>
          </Stack>
        </Stack>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:grid-fill" width={24} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {categories.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Catégories totales
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:eye-fill" width={24} sx={{ color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {categories.filter(cat => cat.visible).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Catégories visibles
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:eye-off-fill" width={24} sx={{ color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {categories.filter(cat => !cat.visible).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Catégories masquées
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tooltip title="Glissez-déposez pour réorganiser">
                    <Iconify icon="eva:move-outline" width={24} sx={{ color: 'info.main' }} />
                  </Tooltip>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Drag & Drop
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'info.main' }}>
                    Réorganisation active
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Categories List with Drag & Drop */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
          {loading && (
            <Stack spacing={2}>
              {[...Array(6)].map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </Stack>
          )}
          
          {!loading && categories.length === 0 && (
            <CategoryEmptyState onCreate={handleCreateCategory} />
          )}
          
          {!loading && categories.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Stack spacing={2}>
                <SortableContext
                  items={tempCategories.map(cat => cat.id)}
                  strategy={rectSortingStrategy}
                >
                  {tempCategories.map((category) => (
                    <SortableCategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => handleEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category.id, category.title)}
                      onManageCocktails={() => handleManageCocktails(category)}
                      isDragging={isDragging && activeId === category.id}
                    />
                  ))}
                </SortableContext>
              </Stack>
              
              <DragOverlay dropAnimation={null}>
                {activeCategory ? (
                  <Box 
                    sx={{ 
                      opacity: 0.9,
                      cursor: 'grabbing',
                      transform: 'rotate(3deg)',
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                      zIndex: 1000,
                    }}
                  >
                    <CategoryCard
                      category={activeCategory}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </Box>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </Card>

        {/* Category Modal */}
        <CategoryModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCategory}
          category={selectedCategory}
          isEditing={isEditing}
          existingOrders={categories.map(cat => cat.displayOrder).filter(order => 
            isEditing ? order !== selectedCategory?.displayOrder : true
          )}
          allCategories={categories}
        />

        {/* Category Cocktails Modal */}
        <CategoryCocktailsModal
          open={cocktailsModalOpen}
          onClose={handleCloseCocktailsModal}
          category={selectedCategoryForCocktails}
        />
      </motion.div>
    </Container>
  );
}