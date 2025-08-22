import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

// ----------------------------------------------------------------------

export default function UserCardSkeleton() {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Status Badge Skeleton */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2 }}>
        {/* Avatar and Basic Info Skeleton */}
        <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Skeleton variant="circular" width={80} height={80} />
            
            {/* Online Status Indicator Skeleton */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
              }}
            >
              <Skeleton variant="circular" width={16} height={16} />
            </Box>
          </Box>

          {/* User Info Skeleton */}
          <Stack alignItems="center" spacing={0.5} sx={{ textAlign: 'center', width: '100%' }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="85%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </Stack>
        </Stack>

        {/* User Type Badge Skeleton */}
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={100} height={24} />
        </Stack>

        {/* Additional Info Skeleton */}
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={80} height={16} />
            </Stack>
            <Skeleton variant="text" width={60} height={16} />
          </Box>
        </Stack>
      </CardContent>

      {/* Quick Actions Skeleton */}
      <CardActions
        sx={{
          justifyContent: 'center',
          gap: 1,
          pb: 2,
        }}
      >
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </CardActions>
    </Card>
  );
}

// Grid of skeleton cards for loading state
export function UserCardSkeletonGrid({ count = 8 }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </>
  );
}

UserCardSkeletonGrid.propTypes = {
  count: PropTypes.number,
};