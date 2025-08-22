import { useState, useEffect } from 'react';
import { doc, query, updateDoc, collection, onSnapshot } from 'firebase/firestore';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { db } from 'src/services/firebase';

import Iconify from 'src/components/iconify';

import ModerationCard from './moderation-card';
import CocktailDetailModal from './cocktail-detail-modal';
import ModerationEmptyState from './moderation-empty-state';
import ModerationStatsCards from './moderation-stats-cards';

// ----------------------------------------------------------------------

export default function ModerationView() {
  const [cocktails, setCocktails] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [selectedCocktails, setSelectedCocktails] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  // Fetch users to map publisher IDs to names
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersMap = {};
      snapshot.docs.forEach(docSnapshot => {
        const userData = docSnapshot.data();
        usersMap[docSnapshot.id] = userData.displayName || userData.email || 'Unknown User';
      });
      setUsers(usersMap);
    });

    return () => unsubscribe();
  }, []);

  // Fetch cocktails from Firestore
  useEffect(() => {
    const q = query(collection(db, 'cocktails'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cocktailsData = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      
      console.log('Cocktails for moderation:', cocktailsData[0]); // Log structure
      setCocktails(cocktailsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching cocktails:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter cocktails based on active tab
  const getFilteredCocktails = () => {
    switch (activeTab) {
      case 'pending':
        return cocktails.filter(c => c.Validated === false || c.Validated === undefined);
      case 'approved':
        return cocktails.filter(c => c.Validated === true);
      case 'rejected':
        return cocktails.filter(c => c.rejected === true);
      default:
        return cocktails;
    }
  };

  // Handle approval of a single cocktail
  const handleApprove = async (cocktailId) => {
    try {
      const cocktailRef = doc(db, 'cocktails', cocktailId);
      await updateDoc(cocktailRef, {
        Validated: true,
        rejected: false,
        moderatedAt: new Date(),
        moderatedBy: 'admin' // You might want to get actual admin user
      });
      console.log('Cocktail approved:', cocktailId);
    } catch (error) {
      console.error('Error approving cocktail:', error);
    }
  };

  // Handle rejection of a single cocktail
  const handleReject = async (cocktailId) => {
    try {
      const cocktailRef = doc(db, 'cocktails', cocktailId);
      await updateDoc(cocktailRef, {
        Validated: false,
        rejected: true,
        moderatedAt: new Date(),
        moderatedBy: 'admin'
      });
      console.log('Cocktail rejected:', cocktailId);
    } catch (error) {
      console.error('Error rejecting cocktail:', error);
    }
  };

  // Handle bulk approval
  const handleBulkApprove = async () => {
    const promises = selectedCocktails.map(id => handleApprove(id));
    await Promise.all(promises);
    setSelectedCocktails([]);
  };

  // Handle bulk rejection
  const handleBulkReject = async () => {
    const promises = selectedCocktails.map(id => handleReject(id));
    await Promise.all(promises);
    setSelectedCocktails([]);
  };

  // Toggle cocktail selection
  const toggleSelection = (cocktailId) => {
    setSelectedCocktails(prev => 
      prev.includes(cocktailId) 
        ? prev.filter(id => id !== cocktailId)
        : [...prev, cocktailId]
    );
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedCocktails([]);
  };

  // Handle cocktail card click to open detail modal
  const handleCocktailClick = (cocktail) => {
    setSelectedCocktail(cocktail);
    setDetailModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedCocktail(null);
  };

  const filteredCocktails = getFilteredCocktails();

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Cocktail Moderation</Typography>
        
        {selectedCocktails.length > 0 && activeTab === 'pending' && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
              onClick={handleBulkApprove}
            >
              Approve Selected ({selectedCocktails.length})
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="eva:close-circle-fill" />}
              onClick={handleBulkReject}
            >
              Reject Selected ({selectedCocktails.length})
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Statistics Cards */}
      <ModerationStatsCards cocktails={cocktails} />

      {/* Tabs for filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={`Pending (${cocktails.filter(c => !c.Validated && !c.rejected).length})`}
            value="pending"
            icon={<Iconify icon="eva:clock-fill" />}
            iconPosition="start"
          />
          <Tab 
            label={`Approved (${cocktails.filter(c => c.Validated === true).length})`}
            value="approved"
            icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            iconPosition="start"
          />
          <Tab 
            label={`Rejected (${cocktails.filter(c => c.rejected === true).length})`}
            value="rejected"
            icon={<Iconify icon="eva:close-circle-fill" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Cocktails Grid */}
      {filteredCocktails.length === 0 ? (
        <ModerationEmptyState status={activeTab} />
      ) : (
        <Grid container spacing={3}>
          {filteredCocktails.map((cocktail) => (
            <Grid item xs={12} sm={6} md={4} key={cocktail.id}>
              <ModerationCard
                cocktail={cocktail}
                publisherName={users[cocktail.publisher]}
                onApprove={() => handleApprove(cocktail.id)}
                onReject={() => handleReject(cocktail.id)}
                isSelected={selectedCocktails.includes(cocktail.id)}
                onToggleSelect={() => toggleSelection(cocktail.id)}
                onCardClick={() => handleCocktailClick(cocktail)}
                showActions={activeTab === 'pending'}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Modal */}
      <CocktailDetailModal
        open={detailModalOpen}
        onClose={handleCloseModal}
        cocktail={selectedCocktail}
        publisherName={selectedCocktail ? users[selectedCocktail.publisher] : null}
        onApprove={() => selectedCocktail && handleApprove(selectedCocktail.id)}
        onReject={() => selectedCocktail && handleReject(selectedCocktail.id)}
      />
    </Container>
  );
}