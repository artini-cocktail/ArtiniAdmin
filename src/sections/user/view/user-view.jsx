import { useState, useEffect, useCallback } from 'react';
import { doc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { alpha, useTheme } from '@mui/material/styles';

import { db } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

import UserCard from '../user-card';
import UserEditModal from '../user-edit-modal';
import UserStatsCards from '../user-stats-cards';
import UserEmptyState from '../user-empty-state';
import UserDetailModal from '../user-detail-modal';
import UserSearchFilters from '../user-search-filters';
import { UserCardSkeletonGrid } from '../user-card-skeleton';

// ----------------------------------------------------------------------

export default function UserPage() {
  const theme = useTheme();
  
  // Core state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch users from Firestore with real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        try {
          const usersData = snapshot.docs.map((docSnapshot) => {
            const userData = docSnapshot.data();
            return {
              ...userData,
              id: docSnapshot.id,
              // Ensure createdAt is properly handled
              createdAt: userData.createdAt?.toDate?.() || new Date(),
            };
          });
          
          console.log('Users data structure:', usersData[0]);
          setUsers(usersData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing users data:', err);
          setError('Failed to load users data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Advanced filtering and sorting logic
  const filteredAndSortedUsers = useCallback(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        (user.displayName || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        (user.company || '').toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'admin':
          filtered = filtered.filter(user => user.admin);
          break;
        case 'user':
          filtered = filtered.filter(user => !user.admin);
          break;
        case 'company':
          filtered = filtered.filter(user => user.isCompany);
          break;
        case 'individual':
          filtered = filtered.filter(user => !user.isCompany);
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue;
      let bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.displayName || '').toLowerCase();
          bValue = (b.displayName || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'role':
          aValue = a.admin ? 1 : 0;
          bValue = b.admin ? 1 : 0;
          break;
        case 'type':
          aValue = a.isCompany ? 1 : 0;
          bValue = b.isCompany ? 1 : 0;
          break;
        case 'recent':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [users, searchQuery, activeFilter, sortBy, sortOrder]);
  
  const filteredUsers = filteredAndSortedUsers();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Handlers
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };
  
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };
  
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setPage(1);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleUserView = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };
  
  const handleUserEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditSuccess = (message) => {
    console.log(message);
    setEditModalOpen(false);
    setSelectedUser(null);
  };
  
  const handleUserDelete = async (user) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.displayName}" ? Cette action est irréversible.`)) {
      try {
        const userRef = doc(db, 'users', user.id);
        await deleteDoc(userRef);
        console.log('User deleted:', user.displayName);
        
        // Close modal if the deleted user was selected
        if (selectedUser?.id === user.id) {
          setModalOpen(false);
          setSelectedUser(null);
        }
      } catch (deleteError) {
        console.error('Error deleting user:', deleteError);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h3" fontWeight={700}>
            Users Management
          </Typography>
        </Stack>
        
        <UserStatsCards users={[]} />
        
        <Grid container spacing={3}>
          <UserCardSkeletonGrid count={12} />
        </Grid>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="xl">
        <UserEmptyState
          title="Error Loading Users"
          description={error}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        justifyContent="space-between" 
        spacing={2}
        sx={{ 
          mb: 5,
          p: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Box>
          <Typography 
            variant="h3" 
            fontWeight={700}
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Users Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and monitor all user accounts
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          size="large"
          startIcon={<Iconify icon="eva:plus-fill" />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
            '&:hover': {
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Add New User
        </Button>
      </Stack>

      {/* Statistics Cards */}
      <UserStatsCards users={users} />

      {/* Search and Filters */}
      <UserSearchFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalResults={filteredUsers.length}
      />

      {/* Users Grid/List */}
      {filteredUsers.length === 0 ? (
        <UserEmptyState
          isSearching={searchQuery || activeFilter !== 'all'}
          title={searchQuery || activeFilter !== 'all' ? "No users found" : "No users yet"}
          description={
            searchQuery || activeFilter !== 'all' 
              ? "Try adjusting your search criteria or filters"
              : "Start by adding your first user to the system"
          }
          actionLabel={!(searchQuery || activeFilter !== 'all') ? "Add First User" : undefined}
        />
      ) : (
        <>
          {/* Users Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {paginatedUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                <UserCard
                  user={user}
                  onView={handleUserView}
                  onEdit={handleUserEdit}
                  onDelete={handleUserDelete}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                py: 3,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 500,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                    transition: 'all 0.2s ease',
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onEdit={handleUserEdit}
        onDelete={handleUserDelete}
      />

      <UserEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />
    </Container>
  );
}
