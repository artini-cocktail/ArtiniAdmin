import { useState, useEffect } from 'react';
import { 
  query, 
  limit, 
  where, 
  orderBy, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';

import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { db } from 'src/services/firebase';

import AppNewsUpdate from '../app-news-update';
import AppWidgetSummary from '../app-widget-summary';
import AppCocktailStats from '../app-cocktail-stats';
import AppRecentCocktails from '../app-recent-cocktails';

// ----------------------------------------------------------------------

export default function AppView() {
  // Loading states
  const [loading, setLoading] = useState({
    users: true,
    cocktails: true,
    articles: true,
    stats: true
  });
  
  // Error states
  const [errors, setErrors] = useState({
    users: false,
    cocktails: false,
    articles: false,
    stats: false
  });

  // Data states
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCocktails, setTotalCocktails] = useState(0);
  const [mostLikedCocktail, setMostLikedCocktail] = useState(null);
  const [mostViewedCocktail, setMostViewedCocktail] = useState(null);
  const [recentCocktails, setRecentCocktails] = useState([]);
  const [topLikedCocktails, setTopLikedCocktails] = useState([]);
  const [topViewedCocktails, setTopViewedCocktails] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [cocktailStats, setCocktailStats] = useState({ types: [], glasses: [] });

  useEffect(() => {
    const unsubscribers = [];

    // Real-time listener for users count
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setTotalUsers(snapshot.size);
        setLoading(prev => ({ ...prev, users: false }));
        setErrors(prev => ({ ...prev, users: false }));
      },
      (error) => {
        console.error('Error fetching users:', error);
        setErrors(prev => ({ ...prev, users: true }));
        setLoading(prev => ({ ...prev, users: false }));
      }
    );
    unsubscribers.push(unsubUsers);

    // Real-time listener for cocktails
    const unsubCocktails = onSnapshot(
      collection(db, 'cocktails'),
      (snapshot) => {
        const cocktails = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        setTotalCocktails(snapshot.size);
        
        // Filter cocktails with likes and views
        const filteredCocktails = cocktails.filter(cocktail => 
          cocktail.likes !== undefined && cocktail.views !== undefined
        );

        // Most liked cocktail
        if (filteredCocktails.length > 0) {
          const mostLiked = filteredCocktails.reduce((prev, current) => 
            (prev.likes > current.likes) ? prev : current
          );
          setMostLikedCocktail({ 
            ...mostLiked, 
            likesText: `${mostLiked.likes} likes` 
          });

          // Most viewed cocktail
          const mostViewed = filteredCocktails.reduce((prev, current) => 
            (prev.views > current.views) ? prev : current
          );
          setMostViewedCocktail({ 
            ...mostViewed, 
            viewsText: `${mostViewed.views} views` 
          });
        }

        // Calculate cocktail statistics
        calculateCocktailStats(cocktails);
        
        setLoading(prev => ({ ...prev, cocktails: false, stats: false }));
        setErrors(prev => ({ ...prev, cocktails: false, stats: false }));
      },
      (error) => {
        console.error('Error fetching cocktails:', error);
        setErrors(prev => ({ ...prev, cocktails: true, stats: true }));
        setLoading(prev => ({ ...prev, cocktails: false, stats: false }));
      }
    );
    unsubscribers.push(unsubCocktails);

    // Real-time listener for recent cocktails
    const unsubRecentCocktails = onSnapshot(
      query(
        collection(db, 'cocktails'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        const cocktails = snapshot.docs
          .map((doc) => ({ 
            id: doc.id, 
            ...doc.data() 
          }))
          .filter(cocktail => cocktail.createdAt); // Filter out cocktails without createdAt
        setRecentCocktails(cocktails);
      },
      (error) => {
        console.error('Error fetching recent cocktails:', error);
      }
    );
    unsubscribers.push(unsubRecentCocktails);

    // Real-time listener for top liked cocktails
    const unsubTopLiked = onSnapshot(
      query(
        collection(db, 'cocktails'),
        where('likes', '>', 0),
        orderBy('likes', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        const cocktails = snapshot.docs
          .map((doc) => ({ 
            id: doc.id, 
            ...doc.data() 
          }))
          .filter(cocktail => cocktail.likes > 0); // Ensure likes exist
        setTopLikedCocktails(cocktails);
      },
      (error) => {
        console.error('Error fetching top liked cocktails:', error);
      }
    );
    unsubscribers.push(unsubTopLiked);

    // Real-time listener for top viewed cocktails
    const unsubTopViewed = onSnapshot(
      query(
        collection(db, 'cocktails'),
        where('views', '>', 0),
        orderBy('views', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        const cocktails = snapshot.docs
          .map((doc) => ({ 
            id: doc.id, 
            ...doc.data() 
          }))
          .filter(cocktail => cocktail.views > 0); // Ensure views exist
        setTopViewedCocktails(cocktails);
      },
      (error) => {
        console.error('Error fetching top viewed cocktails:', error);
      }
    );
    unsubscribers.push(unsubTopViewed);

    // Real-time listener for modules (articles)
    const unsubModules = onSnapshot(
      query(
        collection(db, 'modules'),
        orderBy('createdAt', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        const articles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          postedAt: doc.data().createdAt || doc.data().updatedAt || new Date()
        }));
        setRecentArticles(articles);
        setLoading(prev => ({ ...prev, articles: false }));
        setErrors(prev => ({ ...prev, articles: false }));
      },
      (error) => {
        console.error('Error fetching articles:', error);
        setErrors(prev => ({ ...prev, articles: true }));
        setLoading(prev => ({ ...prev, articles: false }));
      }
    );
    unsubscribers.push(unsubModules);

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const calculateCocktailStats = (cocktails) => {
    // Count by type
    const typeCount = {};
    const glassCount = {};
    
    cocktails.forEach(cocktail => {
      if (cocktail.type) {
        typeCount[cocktail.type] = (typeCount[cocktail.type] || 0) + 1;
      }
      if (cocktail.glass) {
        glassCount[cocktail.glass] = (glassCount[cocktail.glass] || 0) + 1;
      }
    });

    const totalCocktailsWithType = Object.values(typeCount).reduce((a, b) => a + b, 0);
    const totalCocktailsWithGlass = Object.values(glassCount).reduce((a, b) => a + b, 0);

    const types = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        value,
        percentage: totalCocktailsWithType > 0 ? (value / totalCocktailsWithType) * 100 : 0
      }));

    const glasses = Object.entries(glassCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        value,
        percentage: totalCocktailsWithGlass > 0 ? (value / totalCocktailsWithGlass) * 100 : 0
      }));

    setCocktailStats({ types, glasses });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      {/* Global Error Alert */}
      {(errors.users || errors.cocktails || errors.articles || errors.stats) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some data could not be loaded. Please check your connection and try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Widgets */}
        <Grid xs={12} sm={6} md={3}>
          {loading.users ? (
            <Card sx={{ p: 3, height: 140 }}>
              <Skeleton variant="rectangular" height={64} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} />
            </Card>
          ) : (
            <AppWidgetSummary
              title="Users Registered"
              total={totalUsers}
              color="info"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          {loading.cocktails ? (
            <Card sx={{ p: 3, height: 140 }}>
              <Skeleton variant="rectangular" height={64} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} />
            </Card>
          ) : (
            <AppWidgetSummary
              title="Total Cocktails"
              total={totalCocktails}
              color="warning"
              icon={<img alt="icon" src="/assets/icons/glass/ic_whiskey.png" />}
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          {loading.cocktails || !mostLikedCocktail ? (
            <Card sx={{ p: 3, height: 140 }}>
              <Skeleton variant="rectangular" height={64} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} />
            </Card>
          ) : (
            <AppWidgetSummary
              title="Most Liked Cocktail"
              total={mostLikedCocktail.likes || 0}
              numberTotal={mostLikedCocktail.name}
              color="error"
              icon={<img alt="icon" src={mostLikedCocktail.photo || '/assets/icons/glass/ic_whiskey.png'} style={{ width: 64, height: 64, borderRadius: '8px', objectFit: 'cover' }} />}
            />
          )}
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          {loading.cocktails || !mostViewedCocktail ? (
            <Card sx={{ p: 3, height: 140 }}>
              <Skeleton variant="rectangular" height={64} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} />
            </Card>
          ) : (
            <AppWidgetSummary
              title="Most Viewed Cocktail"
              total={mostViewedCocktail.views || 0}
              numberTotal={mostViewedCocktail.name}
              color="success"
              icon={<img alt="icon" src={mostViewedCocktail.photo || '/assets/icons/glass/ic_whiskey.png'} style={{ width: 64, height: 64, borderRadius: '8px', objectFit: 'cover' }} />}
            />
          )}
        </Grid>

        {/* Recent Cocktails */}
        <Grid xs={12} md={6} lg={4}>
          <AppRecentCocktails
            title="Recent Cocktails"
            subheader="Latest cocktails added"
            list={recentCocktails}
            loading={loading.cocktails}
            error={errors.cocktails}
          />
        </Grid>

        {/* Top Liked Cocktails */}
        <Grid xs={12} md={6} lg={4}>
          <AppRecentCocktails
            title="Top Liked Cocktails"
            subheader="Most popular cocktails"
            list={topLikedCocktails}
            loading={loading.cocktails}
            error={errors.cocktails}
          />
        </Grid>

        {/* Top Viewed Cocktails */}
        <Grid xs={12} md={6} lg={4}>
          <AppRecentCocktails
            title="Most Viewed Cocktails"
            subheader="Trending cocktails"
            list={topViewedCocktails}
            loading={loading.cocktails}
            error={errors.cocktails}
          />
        </Grid>

        {/* Cocktail Statistics */}
        <Grid xs={12} md={6} lg={4}>
          <AppCocktailStats
            title="Cocktail Statistics"
            subheader="Distribution by type and glass"
            data={cocktailStats}
            loading={loading.stats}
            error={errors.stats}
          />
        </Grid>

        {/* Recent Articles */}
        <Grid xs={12} md={12} lg={8}>
          <AppNewsUpdate
            title="Recent Articles"
            subheader="Latest articles from modules"
            list={recentArticles}
            loading={loading.articles}
            error={errors.articles}
          />
        </Grid>
      </Grid>
    </Container>
  );
}