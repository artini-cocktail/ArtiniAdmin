import PropTypes from 'prop-types';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SortableCocktailItem({ cocktail, index, onRemove, isDragging = false }) {
  const theme = useTheme();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: cocktail.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          '& .cocktail-actions': {
            opacity: 1,
          },
        },
      }}
      {...attributes}
      {...listeners}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Numéro d'ordre */}
        <Chip
          label={index}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 700,
            minWidth: 32,
          }}
        />

        {/* Avatar du cocktail */}
        <Avatar
          src={cocktail.photo}
          sx={{ 
            width: 48, 
            height: 48,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          {cocktail.name?.charAt(0)?.toUpperCase()}
        </Avatar>

        {/* Informations du cocktail */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cocktail.name || 'Sans nom'}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {cocktail.type || 'Type non défini'}
            </Typography>
            {cocktail.degree && (
              <>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cocktail.degree}°
                </Typography>
              </>
            )}
            {cocktail.difficulty && (
              <>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Chip
                  label={cocktail.difficulty}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 16, 
                    fontSize: '0.65rem',
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              </>
            )}
          </Stack>
        </Box>

        {/* Icône de drag */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Iconify 
            icon="eva:menu-fill" 
            sx={{ 
              color: 'text.disabled',
              transform: 'rotate(90deg)',
            }} 
          />
        </Box>

        {/* Action de suppression */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cocktail-actions"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main',
            },
          }}
        >
          <Iconify icon="eva:trash-2-outline" width={18} />
        </IconButton>
      </Stack>
    </Card>
  );
}

SortableCocktailItem.propTypes = {
  cocktail: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
};