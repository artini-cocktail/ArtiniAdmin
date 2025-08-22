import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function StatsCard({ title, value, icon, color, trend, trendValue }) {
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
      <Stack spacing={1} alignItems="center">
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

        <Typography variant="h3" sx={{ color: `${color}.darker`, fontWeight: 800 }}>
          {value.toLocaleString()}
        </Typography>

        <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
          {title}
        </Typography>

        {trend && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify
              icon={trend === 'up' ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
              width={16}
              height={16}
              sx={{
                color: trend === 'up' ? 'success.main' : 'error.main',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: trend === 'up' ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {trendValue}%
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export default function UserStatsCards({ users }) {
  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.admin).length;
  const companyUsers = users.filter(user => user.isCompany).length;
  const individualUsers = totalUsers - companyUsers;

  const adminRate = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : 0;
  const companyRate = totalUsers > 0 ? ((companyUsers / totalUsers) * 100).toFixed(1) : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 5 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon="eva:people-fill"
          color="primary"
          trend="up"
          trendValue="12.5"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Administrators"
          value={adminUsers}
          icon="eva:shield-fill"
          color="success"
          trend="up"
          trendValue={adminRate}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Companies"
          value={companyUsers}
          icon="eva:briefcase-fill"
          color="info"
          trend="up"
          trendValue={companyRate}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Individuals"
          value={individualUsers}
          icon="eva:person-fill"
          color="warning"
          trend="down"
          trendValue="2.1"
        />
      </Grid>
    </Grid>
  );
}

UserStatsCards.propTypes = {
  users: PropTypes.array,
};

StatsCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number,
  icon: PropTypes.string,
  color: PropTypes.string,
  trend: PropTypes.string,
  trendValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};