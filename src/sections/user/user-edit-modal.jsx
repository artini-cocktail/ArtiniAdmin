import { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc } from 'firebase/firestore';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { db } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserEditModal({ open, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    admin: user?.admin || false,
    isCompany: user?.isCompany || false,
    isPaid: user?.isPaid || false,
  });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, formData);
      
      if (onSuccess) {
        onSuccess('Utilisateur mis à jour avec succès');
      }
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            Modifier l&apos;utilisateur
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Basic Information */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Informations de base
          </Typography>
          
          <TextField
            fullWidth
            label="Nom d'affichage"
            value={formData.displayName}
            onChange={handleChange('displayName')}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            variant="outlined"
          />

          {/* Account Settings */}
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Paramètres du compte
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.admin}
                onChange={handleChange('admin')}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Administrateur</Typography>
                <Typography variant="caption" color="text.secondary">
                  Accorde tous les privilèges d&apos;administration
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isCompany}
                onChange={handleChange('isCompany')}
                color="info"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Compte entreprise</Typography>
                <Typography variant="caption" color="text.secondary">
                  Marquer comme compte professionnel
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPaid}
                onChange={handleChange('isPaid')}
                color="warning"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Compte premium</Typography>
                <Typography variant="caption" color="text.secondary">
                  Accès aux fonctionnalités premium
                </Typography>
              </Box>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="eva:save-fill" />}
          disabled={loading}
        >
          {loading ? 'Mise à jour...' : 'Sauvegarder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};