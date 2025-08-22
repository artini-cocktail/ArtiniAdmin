import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ModerationCard({ 
  cocktail, 
  publisherName,
  onApprove, 
  onReject, 
  isSelected, 
  onToggleSelect,
  onCardClick,
  showActions = true 
}) {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  // Extract cocktail properties (using actual field names from Firebase)
  const name = cocktail?.name || 'Unnamed Cocktail';
  const category = cocktail?.category || 'Uncategorized';
  const image = cocktail?.photo;
  const ingredients = cocktail?.ingredients || [];
  const createdAt = cocktail?.createdAt;
  const validated = cocktail?.Validated === true;
  const rejected = cocktail?.rejected === true;
  const degree = cocktail?.degree || 'Unknown';
  const description = cocktail?.description;

  // Get status color and label
  const getStatus = () => {
    if (validated) {
      return { color: 'success', label: 'Approved', icon: 'eva:checkmark-circle-2-fill' };
    }
    if (rejected) {
      return { color: 'error', label: 'Rejected', icon: 'eva:close-circle-fill' };
    }
    return { color: 'warning', label: 'Pending', icon: 'eva:clock-fill' };
  };

  const status = getStatus();

  return (
    <Card
      onClick={onCardClick}
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/* Selection Checkbox */}
      {showActions && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelect}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          />
        </Box>
      )}

      {/* Status Badge */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <Chip
          size="small"
          label={status.label}
          color={status.color}
          icon={<Iconify icon={status.icon} width={16} />}
        />
      </Box>

      {/* Cocktail Image */}
      <Box
        sx={{
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
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
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
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
              width={64} 
              sx={{ color: 'primary.main', opacity: 0.48 }} 
            />
          </Box>
        )}
      </Box>

      <CardContent>
        <Typography variant="h6" noWrap sx={{ mb: 1 }}>
          {name}
        </Typography>

        <Stack spacing={1.5}>
          {/* Category */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:pricetags-fill" width={16} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {category}
            </Typography>
          </Box>

          {/* Degree (Alcohol type) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:glass-cocktail" width={16} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {degree}
            </Typography>
          </Box>

          {/* Ingredients Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="eva:list-fill" width={16} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {ingredients.length} ingrédients
            </Typography>
          </Box>

          {/* Publisher Name if available */}
          {publisherName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:person-fill" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {publisherName}
              </Typography>
            </Box>
          )}

          {/* Description Preview */}
          {description && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Iconify icon="eva:file-text-fill" width={16} sx={{ color: 'text.secondary', mt: 0.5 }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}
              >
                {description}
              </Typography>
            </Box>
          )}

          {/* Created Date - Only show if available */}
          {createdAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:calendar-fill" width={16} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {(() => {
                  try {
                    if (createdAt.toDate) {
                      return createdAt.toDate().toLocaleDateString();
                    }
                    if (createdAt instanceof Date) {
                      return createdAt.toLocaleDateString();
                    }
                    if (createdAt.seconds) {
                      return new Date(createdAt.seconds * 1000).toLocaleDateString();
                    }
                    return new Date(createdAt).toLocaleDateString();
                  } catch (error) {
                    console.error('Error parsing date:', error);
                    return null;
                  }
                })()}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Action Buttons */}
      {showActions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.8),
                '&:hover': {
                  bgcolor: theme.palette.success.main,
                },
              }}
            >
              Approve
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="eva:close-circle-fill" />}
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              Reject
            </Button>
          </Stack>
        </CardActions>
      )}

      {/* View Details Button for approved/rejected */}
      {!showActions && (
        <CardActions sx={{ px: 2, pb: 2, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton color="primary">
              <Iconify icon="eva:eye-fill" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
}

ModerationCard.propTypes = {
  cocktail: PropTypes.object.isRequired,
  publisherName: PropTypes.string,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  onCardClick: PropTypes.func,
  showActions: PropTypes.bool,
};