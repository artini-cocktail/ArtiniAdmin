import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ModerationEmptyState({ status }) {
  const theme = useTheme();

  const getContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: 'eva:checkmark-circle-2-fill',
          title: 'All Caught Up!',
          description: 'No cocktails pending moderation at the moment.',
          color: 'success',
        };
      case 'approved':
        return {
          icon: 'eva:shield-fill',
          title: 'No Approved Cocktails',
          description: 'Approved cocktails will appear here.',
          color: 'primary',
        };
      case 'rejected':
        return {
          icon: 'eva:close-circle-fill',
          title: 'No Rejected Cocktails',
          description: 'Rejected cocktails will appear here.',
          color: 'error',
        };
      default:
        return {
          icon: 'fluent:drink-cocktail-24-filled',
          title: 'No Cocktails',
          description: 'Cocktails will appear here once submitted.',
          color: 'primary',
        };
    }
  };

  const content = getContent();

  return (
    <Card
      sx={{
        textAlign: 'center',
        p: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette[content.color].main, 0.08)} 0%, ${alpha(
          theme.palette[content.color].main,
          0.02
        )} 100%)`,
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette[content.color].main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
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
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px dashed ${alpha(theme.palette[content.color].main, 0.2)}`,
              animation: 'pulse 2s infinite',
            },
          }}
        >
          <Iconify
            icon={content.icon}
            width={56}
            sx={{ color: `${content.color}.main` }}
          />
        </Box>

        <Stack spacing={1}>
          <Typography variant="h5" color={`${content.color}.dark`}>
            {content.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {content.description}
          </Typography>
        </Stack>

        {status === 'pending' && (
          <Button
            variant="outlined"
            color={content.color}
            startIcon={<Iconify icon="eva:refresh-fill" />}
          >
            Refresh
          </Button>
        )}
      </Stack>
    </Card>
  );
}

ModerationEmptyState.propTypes = {
  status: PropTypes.string.isRequired,
};