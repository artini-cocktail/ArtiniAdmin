import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserEmptyState({ 
  title = "No users found",
  description = "Try adjusting your search or filter criteria",
  actionLabel,
  onAction,
  isSearching = false 
}) {
  const theme = useTheme();

  const getEmptyStateContent = () => {
    if (isSearching) {
      return {
        icon: 'eva:search-fill',
        title: 'No search results',
        description: 'We couldn\'t find any users matching your search criteria. Try different keywords or filters.',
      };
    }
    return {
      icon: 'eva:people-outline',
      title,
      description,
    };
  };

  const content = getEmptyStateContent();

  return (
    <Card
      sx={{
        p: 6,
        textAlign: 'center',
        border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
        bgcolor: alpha(theme.palette.grey[500], 0.02),
      }}
    >
      <Stack alignItems="center" spacing={3}>
        {/* Illustration */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 0.3,
                },
                '50%': {
                  transform: 'scale(1.05)',
                  opacity: 0.1,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 0.3,
                },
              },
              animation: 'pulse 2s infinite',
            },
          }}
        >
          <Iconify
            icon={content.icon}
            width={48}
            height={48}
            sx={{ 
              color: 'primary.main',
              opacity: 0.8,
            }}
          />
        </Box>

        {/* Text Content */}
        <Stack spacing={1} sx={{ maxWidth: 400 }}>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            {content.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {content.description}
          </Typography>
        </Stack>

        {/* Action Button */}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            size="large"
            onClick={onAction}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
            }}
          >
            {actionLabel}
          </Button>
        )}

        {/* Additional Help */}
        {isSearching && (
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Try searching for:
            </Typography>
            {['John', 'admin@example.com', 'Company'].map((suggestion, index) => (
              <Box
                key={index}
                component="span"
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  color: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                {suggestion}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

    </Card>
  );
}

UserEmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  isSearching: PropTypes.bool,
};