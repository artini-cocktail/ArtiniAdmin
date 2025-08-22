import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { fPercent } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function AppCocktailStats({ title, subheader, data, loading, error, ...other }) {
  if (error) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader="Error loading data" />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Failed to load statistics</Typography>
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
          <Box sx={{ p: 3 }}>
            {data.types && data.types.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  By Type
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {data.types.map((item) => (
                    <StatItem key={item.label} item={item} icon="eva:layers-fill" />
                  ))}
                </Stack>
              </>
            )}

            {data.glasses && data.glasses.length > 0 && (
              <>
                <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  By Glass
                </Typography>
                <Stack spacing={2}>
                  {data.glasses.map((item) => (
                    <StatItem key={item.label} item={item} icon="eva:droplet-fill" />
                  ))}
                </Stack>
              </>
            )}
          </Box>
        )}
      </Scrollbar>
    </Card>
  );
}

AppCocktailStats.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  data: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

// ----------------------------------------------------------------------

function StatItem({ item, icon }) {
  const { label, value, percentage } = item;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={24} sx={{ color: 'text.secondary' }} />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle2" noWrap>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {value}
          </Typography>
        </Stack>
        
        <Stack direction="row" alignItems="center" spacing={1}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 40 }}>
            {fPercent(percentage)}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

StatItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number,
    percentage: PropTypes.number,
  }),
  icon: PropTypes.string,
};