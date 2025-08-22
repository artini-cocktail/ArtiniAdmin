import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function AppRecentCocktails({ title, subheader, list, loading, error, ...other }) {
  if (error) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader="Error loading data" />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Failed to load cocktails</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
            {list.map((cocktail) => (
              <CocktailItem key={cocktail.id} cocktail={cocktail} />
            ))}
          </Stack>
        )}
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View all
        </Button>
      </Box>
    </Card>
  );
}

AppRecentCocktails.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

// ----------------------------------------------------------------------

function CocktailItem({ cocktail }) {
  const { photo, name, type, glass, createdAt, likes, views, Validated } = cocktail;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={name}
        src={photo || '/assets/images/cocktails/default-cocktail.jpg'}
        sx={{ 
          width: 64, 
          height: 64, 
          borderRadius: 2, 
          flexShrink: 0,
          objectFit: 'cover',
          border: '1px solid',
          borderColor: 'divider'
        }}
        onError={(e) => {
          e.target.src = '/assets/images/cocktails/default-cocktail.jpg';
        }}
      />

      <Box sx={{ minWidth: 200, flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
            {name}
          </Link>
          {Validated && (
            <Iconify 
              icon="eva:checkmark-circle-2-fill" 
              sx={{ color: 'success.main', width: 16, height: 16 }} 
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
          {type && (
            <Chip 
              label={type} 
              size="small" 
              variant="soft" 
              color="primary"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
          {glass && (
            <Chip 
              label={glass} 
              size="small" 
              variant="soft" 
              color="secondary"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={2}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <Iconify icon="eva:heart-fill" sx={{ mr: 0.5, width: 12, height: 12 }} />
            {likes || 0}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <Iconify icon="eva:eye-fill" sx={{ mr: 0.5, width: 12, height: 12 }} />
            {views || 0}
          </Typography>
        </Stack>
      </Box>

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {(() => {
          if (!createdAt) return 'N/A';
          
          try {
            // Handle Firestore Timestamp
            if (createdAt.toDate && typeof createdAt.toDate === 'function') {
              const date = createdAt.toDate();
              return fToNow(date);
            }
            
            // Handle regular date or timestamp
            const date = new Date(createdAt);
            if (Number.isNaN(date.getTime())) {
              return 'N/A';
            }
            return fToNow(date);
          } catch (error) {
            console.warn('Invalid date format:', createdAt, error);
            return 'N/A';
          }
        })()}
      </Typography>
    </Stack>
  );
}

CocktailItem.propTypes = {
  cocktail: PropTypes.shape({
    id: PropTypes.string,
    photo: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    glass: PropTypes.string,
    createdAt: PropTypes.object,
    likes: PropTypes.number,
    views: PropTypes.number,
    Validated: PropTypes.bool,
  }),
};