import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserCard({ user, onView, onEdit, onDelete }) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Safely access user properties with fallbacks
  const displayName = user?.displayName || 'Unknown User';
  const email = user?.email || 'No email provided';
  const photoURL = user?.photoURL;
  const isVerified = user?.admin || false; // Use admin status for verification
  const isCompany = user?.isCompany || false;
  const userId = user?.id;
  const createdAt = user?.createdAt;

  // Generate initials from display name for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get verification status color and label
  const getVerificationStatus = () => {
    if (isVerified) {
      return {
        color: 'success',
        label: 'Admin',
        icon: 'eva:shield-fill',
      };
    }
    return {
      color: 'default',
      label: 'User',
      icon: 'eva:person-fill',
    };
  };

  const verificationStatus = getVerificationStatus();

  // Get company status
  const getCompanyType = () => {
    if (isCompany) {
      return {
        color: 'info',
        label: 'Company',
        icon: 'eva:briefcase-fill',
      };
    }
    return {
      color: 'default',
      label: 'Individual',
      icon: 'eva:person-fill',
    };
  };

  const companyType = getCompanyType();

  return (
    <Card
      component="article"
      role="button"
      tabIndex={0}
      aria-label={`User ${displayName}, ${email}`}
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        '&:hover, &:focus': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          outline: 'none',
          '& .user-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}, 0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(user)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView?.(user);
        }
      }}
    >
      {/* Status Badges */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title={verificationStatus.label}>
            <Chip
              size="small"
              icon={<Iconify icon={verificationStatus.icon} width={16} />}
              label={verificationStatus.label}
              color={verificationStatus.color}
              variant="filled"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-icon': {
                  fontSize: 16,
                },
              }}
            />
          </Tooltip>
        </Stack>
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2 }}>
        {/* Avatar and Basic Info */}
        <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={photoURL}
              alt={displayName}
              sx={{
                width: 80,
                height: 80,
                fontSize: 32,
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                border: `4px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s ease',
                ...(isHovered && {
                  transform: 'scale(1.1)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                }),
              }}
            >
              {!photoURL && getInitials(displayName)}
            </Avatar>

            {/* Online Status Indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 16,
                height: 16,
                bgcolor: 'success.main',
                borderRadius: '50%',
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          </Box>

          {/* User Info */}
          <Stack alignItems="center" spacing={0.5} sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                maxWidth: '100%',
                color: 'text.primary',
              }}
            >
              {displayName}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: '100%', fontSize: '0.875rem' }}
            >
              {email}
            </Typography>

            {userId && (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.75rem' }}
              >
                ID: {userId.slice(0, 8)}...
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* User Type Badge */}
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Chip
            icon={<Iconify icon={companyType.icon} width={16} />}
            label={companyType.label}
            color={companyType.color}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          />
        </Stack>

        {/* Additional Info - Only show if date is available */}
        {createdAt && (
          <Stack spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify 
                  icon="eva:calendar-fill" 
                  width={16} 
                  sx={{ color: 'text.secondary' }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Member since
                </Typography>
              </Box>
              <Typography variant="caption" color="text.primary" fontWeight={500}>
                {createdAt instanceof Date 
                  ? createdAt.toLocaleDateString() 
                  : new Date(createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        )}
      </CardContent>

      {/* Quick Actions */}
      <CardActions
        className="user-actions"
        sx={{
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'all 0.3s ease',
          justifyContent: 'center',
          gap: 1,
          pb: 2,
        }}
      >
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(user);
            }}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <Iconify icon="eva:eye-fill" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit User">
          <IconButton
            size="small"
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(user);
            }}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.2),
              },
            }}
          >
            <Iconify icon="eva:edit-fill" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete User">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(user);
            }}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};