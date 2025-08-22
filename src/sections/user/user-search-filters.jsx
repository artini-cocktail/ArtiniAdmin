import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'name', label: 'Name', icon: 'eva:text-fill' },
  { value: 'email', label: 'Email', icon: 'eva:email-fill' },
  { value: 'role', label: 'Role', icon: 'eva:shield-fill' },
  { value: 'type', label: 'User Type', icon: 'eva:people-fill' },
  { value: 'recent', label: 'Recently Added', icon: 'eva:clock-fill' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Users', icon: 'eva:people-fill', color: 'default' },
  { value: 'admin', label: 'Administrators', icon: 'eva:shield-fill', color: 'success' },
  { value: 'user', label: 'Regular Users', icon: 'eva:person-fill', color: 'info' },
  { value: 'company', label: 'Companies', icon: 'eva:briefcase-fill', color: 'warning' },
  { value: 'individual', label: 'Individuals', icon: 'eva:person-outline', color: 'primary' },
];

const VIEW_OPTIONS = [
  { value: 'grid', icon: 'eva:grid-fill', tooltip: 'Grid View' },
  { value: 'list', icon: 'eva:list-fill', tooltip: 'List View' },
];

// ----------------------------------------------------------------------

export default function UserSearchFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) {
  const theme = useTheme();
  const [sortPopover, setSortPopover] = useState(null);

  const handleSortClick = (event) => {
    setSortPopover(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortPopover(null);
  };

  const handleSortSelect = (value) => {
    onSortChange(value);
    handleSortClose();
  };

  const activeFilterOption = FILTER_OPTIONS.find(option => option.value === activeFilter);
  const activeSortOption = SORT_OPTIONS.find(option => option.value === sortBy);

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalResults} users found
            </Typography>
          </Box>

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newValue) => newValue && onViewModeChange(newValue)}
            size="small"
          >
            {VIEW_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  px: 2,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <Iconify icon={option.icon} width={20} />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search users by name, email, or company..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={() => onSearchChange('')}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Iconify icon="eva:close-fill" width={16} />
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
              },
            },
          }}
        />

        {/* Filters and Sort */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Filter Chips */}
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ flex: 1 }}>
            {FILTER_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                icon={<Iconify icon={option.icon} width={16} />}
                label={option.label}
                clickable
                color={activeFilter === option.value ? option.color : 'default'}
                variant={activeFilter === option.value ? 'filled' : 'outlined'}
                onClick={() => onFilterChange(option.value)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                }}
              />
            ))}
          </Stack>

          {/* Sort Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              onClick={handleSortClick}
              startIcon={<Iconify icon={activeSortOption?.icon || 'eva:funnel-fill'} />}
              endIcon={<Iconify icon="eva:chevron-down-fill" />}
              sx={{
                borderColor: alpha(theme.palette.grey[500], 0.32),
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {activeSortOption?.label || 'Sort'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{
                minWidth: 'auto',
                p: 1,
                borderColor: alpha(theme.palette.grey[500], 0.32),
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Iconify
                icon={sortOrder === 'asc' ? 'eva:arrow-upward-fill' : 'eva:arrow-downward-fill'}
                width={20}
              />
            </Button>
          </Stack>
        </Stack>

        {/* Active Filters Display */}
        {(searchQuery || activeFilter !== 'all') && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Active filters:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size="small"
                  onDelete={() => onSearchChange('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {activeFilter !== 'all' && (
                <Chip
                  icon={<Iconify icon={activeFilterOption?.icon} width={14} />}
                  label={activeFilterOption?.label}
                  size="small"
                  onDelete={() => onFilterChange('all')}
                  color={activeFilterOption?.color}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Sort Options Popover */}
      <Popover
        open={Boolean(sortPopover)}
        anchorEl={sortPopover}
        onClose={handleSortClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { width: 200, p: 1 },
        }}
      >
        <Stack spacing={0.5}>
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="text"
              startIcon={<Iconify icon={option.icon} />}
              onClick={() => handleSortSelect(option.value)}
              sx={{
                justifyContent: 'flex-start',
                py: 1,
                px: 2,
                color: sortBy === option.value ? 'primary.main' : 'text.primary',
                bgcolor: sortBy === option.value ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </Popover>
    </Card>
  );
}

UserSearchFilters.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  activeFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func,
  sortOrder: PropTypes.string,
  onSortOrderChange: PropTypes.func,
  viewMode: PropTypes.string,
  onViewModeChange: PropTypes.func,
  totalResults: PropTypes.number,
};