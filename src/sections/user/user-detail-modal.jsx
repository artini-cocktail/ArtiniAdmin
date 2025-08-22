import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserDetailModal({ open, onClose, user, onEdit, onDelete }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  // Safely access user properties
  const displayName = user?.displayName || 'Unknown User';
  const email = user?.email || 'No email provided';
  const photoURL = user?.photoURL;
  const isVerified = user?.admin || false; // Use admin status
  const isCompany = user?.isCompany || false;
  const userId = user?.id || 'N/A';
  const createdAt = user?.createdAt;

  // Generate initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'eva:person-fill' },
    { id: 'activity', label: 'Activity', icon: 'eva:activity-fill' },
    { id: 'settings', label: 'Settings', icon: 'eva:settings-fill' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderOverview = () => (
    <Stack spacing={3}>
      {/* Profile Section */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} alignItems="flex-start">
          <Avatar
            src={photoURL}
            alt={displayName}
            sx={{
              width: 80,
              height: 80,
              fontSize: 28,
              fontWeight: 600,
              bgcolor: theme.palette.primary.main,
              color: 'white',
            }}
          >
            {!photoURL && getInitials(displayName)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {displayName}
              </Typography>
              {isVerified && (
                <Chip
                  icon={<Iconify icon="eva:shield-fill" width={16} />}
                  label="Admin"
                  color="success"
                  size="small"
                />
              )}
            </Stack>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {email}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<Iconify icon={isCompany ? 'eva:briefcase-fill' : 'eva:person-fill'} width={16} />}
                label={isCompany ? 'Company' : 'Individual'}
                color={isCompany ? 'info' : 'default'}
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
        </Stack>
      </Card>

      {/* Details Grid */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* User Information */}
        <Card sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                User ID
              </Typography>
              <Typography variant="body1">{userId}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Display Name
              </Typography>
              <Typography variant="body1">{displayName}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email Address
              </Typography>
              <Typography variant="body1">{email}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account Type
              </Typography>
              <Typography variant="body1">
                {isCompany ? 'Company Account' : 'Individual Account'}
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Account Status */}
        <Card sx={{ flex: 1, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Status
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                User Role
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon={isVerified ? 'eva:shield-fill' : 'eva:person-fill'}
                  width={20}
                  sx={{ color: isVerified ? 'success.main' : 'text.secondary' }}
                />
                <Typography variant="body1" color={isVerified ? 'success.main' : 'text.primary'}>
                  {isVerified ? 'Administrator' : 'Regular User'}
                </Typography>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account Status
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="body1" color="success.main">
                  Active
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );

  const renderActivity = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          color: 'text.secondary',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Iconify icon="eva:clock-outline" width={48} sx={{ opacity: 0.5 }} />
          <Typography variant="body1">
            Activity data not available
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Activity tracking is not implemented yet
          </Typography>
        </Stack>
      </Box>
    </Card>
  );

  const renderSettings = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        User Settings
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          color: 'text.secondary',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Iconify icon="eva:settings-outline" width={48} sx={{ opacity: 0.5 }} />
          <Typography variant="body1">
            Use the Edit button to modify user settings
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Settings are managed through the edit modal
          </Typography>
        </Stack>
      </Box>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            User Details
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Stack direction="row" spacing={0}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="text"
                startIcon={<Iconify icon={tab.icon} />}
                onClick={() => handleTabChange(tab.id)}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 0,
                  color: activeTab === tab.id ? 'primary.main' : 'text.secondary',
                  borderBottom: activeTab === tab.id ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'activity' && renderActivity()}
          {activeTab === 'settings' && renderSettings()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Iconify icon="eva:trash-2-fill" />}
          onClick={() => onDelete && onDelete(user)}
        >
          Delete User
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:save-fill" />}
          onClick={() => onEdit && onEdit(user)}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserDetailModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};