import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

export function CategoryCardSkeleton() {
  return (
    <Card 
      sx={{ 
        height: 100, 
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Image skeleton */}
      <Skeleton 
        variant="rectangular" 
        width={60} 
        height={60} 
        sx={{ ml: 2, borderRadius: 2, flexShrink: 0 }} 
      />
      
      {/* Content skeleton */}
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Stack spacing={1}>
          <Skeleton variant="text" height={24} width="70%" />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton variant="text" width={40} height={16} />
            <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
      </CardContent>
      
      {/* Actions skeleton */}
      <Stack direction="row" spacing={1} sx={{ pr: 2, flexShrink: 0 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
    </Card>
  );
}