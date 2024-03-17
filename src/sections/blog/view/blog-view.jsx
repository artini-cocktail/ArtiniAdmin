import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { db } from 'src/services/firebase';

import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, updateDoc, setDoc } from "firebase/firestore";

import Iconify from 'src/components/iconify';

import PostCard from '../post-card';
import PostSort from '../post-sort';
import PostSearch from '../post-search';

// ----------------------------------------------------------------------

export default function BlogView() {
  const [posts, setPosts] = useState([]);
  const [categoryData, setCategoryData] = useState([{ title: 'All', icon: 'layers', key: 'All' }]);
  const [allArticles, setAllArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = selectedCategory === 'All'
    ? allArticles
    : allArticles.filter(article => article.category === selectedCategory);

  useEffect(() => {
    const fetchData = async () => {
      const moduleData = await fetchModules(); // Assurez-vous que fetchModules récupère les données correctement

      if (moduleData && moduleData.length > 0) {
        const categories = Object.keys(moduleData[0]).filter(key => key !== 'id'); // Exclure l'ID du document
        const minimizedArticles = {};

        categories.forEach(category => {
          minimizedArticles[category] = moduleData[0][category].Articles;
        });

        setPosts(minimizedArticles);

        // Pour aplatir les articles de toutes catégories
        const flattenedArticles = Object.values(minimizedArticles).reduce((acc, curr) => {
          return [...acc, ...Object.values(curr)];
        }, []);
        setAllArticles(flattenedArticles);

        // Préparation des données de catégorie
        const categoriesData = categories.map(category => ({
          name: category,
          title: moduleData[0][category].title,
          icon: moduleData[0][category].icon,
        }));

        setCategoryData(categoriesData);
      }
    };

    fetchData();
  }, []);

  const prepareCategoryData = (modules) => {
    return Object.entries(modules).map(([key, value]) => ({
      title: value?.title,
      icon: value?.icon,
      key: key, // Utilisez la clé de catégorie comme key pour le keyExtractor de FlatList
    }));
  };
  const flattenArticles = (modules) => {
    let allArticles = [];
    Object.entries(modules).forEach(([categoryKey, categoryValue]) => {
      const articles = Object.entries(categoryValue.Articles).map(([articleKey, article]) => ({
        ...article,
        category: categoryKey,
        id: articleKey, // Ajout d'un identifiant unique pour chaque article
      }));
      allArticles = [...allArticles, ...articles];
    });
    return allArticles;
  };



  if (posts) {
    return (
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Blog</Typography>

          <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => { window.location.href = '/create-article'; }}>
            New Post
          </Button>
        </Stack>

        <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
          <PostSearch posts={posts} />
          <PostSort
            options={[
              { value: 'latest', label: 'Latest' },
              { value: 'popular', label: 'Popular' },
              { value: 'oldest', label: 'Oldest' },
            ]}
          />
        </Stack>

        <Grid container spacing={3}>
          {filteredArticles.map((post) => (
            // <Typography key={post.id} variant="h4">{post.title}</Typography>

            <Grid key={post.id} item xs={12} sm={6} md={4}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
}



const fetchModules = async () => {
  try {
    const modulesRef = collection(db, 'modules');
    const querySnapshot = await getDocs(modulesRef);
    const data = querySnapshot.docs.map((document) => { return { id: document.id, ...document.data() } });
    return data
  } catch (error) {
    console.log(error);
  }
}