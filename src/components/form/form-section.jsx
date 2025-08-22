import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// Modern form section component with subtle animations
export default function FormSection({ title, children, icon, delay = 0, ...other }) {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          '&:hover': {
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        }}
        {...other}
      >
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            }}
          >
            {icon && (
              <Box
                sx={{
                  mr: 2,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                {icon}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
        )}
        {children}
      </Card>
    </motion.div>
  );
}

FormSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  delay: PropTypes.number,
};