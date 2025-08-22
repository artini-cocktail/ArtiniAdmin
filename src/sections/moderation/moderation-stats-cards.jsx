import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function StatsCard({ title, value, icon, color, percentage }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: 0,
        textAlign: 'center',
        color: `${color}.darker`,
        bgcolor: `${color}.lighter`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Iconify
          icon={icon}
          width={48}
          height={48}
          sx={{
            bgcolor: `${color}.main`,
            borderRadius: '50%',
            p: 1.5,
            color: 'common.white',
          }}
        />

        <Stack spacing={0.5} alignItems="center">
          <Typography variant="h3" sx={{ color: `${color}.darker`, fontWeight: 800 }}>
            {value}
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
            {title}
          </Typography>
        </Stack>

        {percentage !== undefined && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(theme.palette[color].main, 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: `${color}.main`,
                },
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.72 }}>
              {percentage.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}

export default function ModerationStatsCards({ cocktails }) {
  const totalCocktails = cocktails.length;
  const pendingCocktails = cocktails.filter(c => !c.Validated && !c.rejected).length;
  const approvedCocktails = cocktails.filter(c => c.Validated === true).length;
  const rejectedCocktails = cocktails.filter(c => c.rejected === true).length;

  const approvalRate = totalCocktails > 0 ? (approvedCocktails / totalCocktails) * 100 : 0;
  const rejectionRate = totalCocktails > 0 ? (rejectedCocktails / totalCocktails) * 100 : 0;
  const pendingRate = totalCocktails > 0 ? (pendingCocktails / totalCocktails) * 100 : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Total Cocktails"
          value={totalCocktails}
          icon="fluent:drink-cocktail-24-filled"
          color="primary"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Pending Review"
          value={pendingCocktails}
          icon="eva:clock-fill"
          color="warning"
          percentage={pendingRate}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Approved"
          value={approvedCocktails}
          icon="eva:checkmark-circle-2-fill"
          color="success"
          percentage={approvalRate}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Rejected"
          value={rejectedCocktails}
          icon="eva:close-circle-fill"
          color="error"
          percentage={rejectionRate}
        />
      </Grid>
    </Grid>
  );
}

ModerationStatsCards.propTypes = {
  cocktails: PropTypes.array.isRequired,
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  percentage: PropTypes.number,
};