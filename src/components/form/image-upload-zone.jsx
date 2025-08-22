import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import Iconify from 'src/components/iconify';

// Modern drag & drop image upload component
export default function ImageUploadZone({ 
  value, 
  onChange, 
  uploadProgress = 0, 
  isUploading = false,
  placeholder = '/assets/background/overlay_create_cocktail.png',
  ...other 
}) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && onChange) {
      onChange(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && onChange) {
      onChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemoveImage = () => {
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...other}
    >
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          position: 'relative',
          p: 3,
          textAlign: 'center',
          border: `2px dashed ${isDragOver ? theme.palette.primary.main : alpha(theme.palette.grey[500], 0.32)}`,
          borderRadius: 2,
          bgcolor: isDragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          overflow: 'hidden',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={typeof value === 'string' ? value : placeholder}
                  alt="Preview"
                  sx={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    boxShadow: theme.shadows[8],
                  }}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: theme.palette.error.main,
                    color: 'white',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: theme.palette.error.dark,
                    },
                  }}
                >
                  <Iconify icon="eva:close-fill" width={16} />
                </IconButton>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  py: 6,
                  px: 3,
                }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Iconify
                    icon="eva:cloud-upload-fill"
                    sx={{
                      width: 64,
                      height: 64,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  />
                </motion.div>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Glissez votre image ici
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  ou cliquez pour parcourir vos fichiers
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="eva:camera-fill" />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Choisir une image
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Upload en cours... {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    borderRadius: 1,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                    }
                  }} 
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

ImageUploadZone.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  uploadProgress: PropTypes.number,
  isUploading: PropTypes.bool,
  placeholder: PropTypes.string,
};