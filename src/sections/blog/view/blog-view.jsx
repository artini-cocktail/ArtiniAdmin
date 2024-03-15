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

  // const setNewData = async () => {
  //   const ModuleData = await fetchModules();
  //   console.log("modulId", ModuleData);
  //   const setDocRef = doc(db, "modules", ModuleData[0].id);
  //   await setDoc(setDocRef, {
  //     "Skills":
  //     {
  //       "Articles":
  //       {
  //         "Shaking 2":
  //         {
  //           "title": "Shaing 2",
  //           "nbPages": 3,
  //           "timeToRead": 5,
  //           "image": "https://firebasestorage.googleapis.com/v0/b/artini-2.appspot.com/o/Articles%2FTequilla.jpg?alt=media&token=3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e",
  //           "likes": 0,
  //           "description": "La Shaking 2 est une boisson alcoolisée mexicaine fabriquée à partir de l'agave bleu."
  //         },
  //         "Shaking":
  //         {
  //           "nbPages": 3,
  //           "title": "Shaking",
  //           "timeToRead": 5,
  //           "image": "https://firebasestorage.googleapis.com/v0/b/artini-2.appspot.com/o/Articles%2FMartini.jpg?alt=media&token=3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e",
  //           "likes": 0,
  //           "description": "Le Shaking est un cocktail à base de gin et de vermouth, servi avec une olive ou un zeste de citron."
  //         },
  //         "Technique 1":
  //         {
  //           "nbPages": 3,
  //           "title": "Technique",
  //           "description": "Le Technique est une eau-de-vie obtenue par distillation de céréales maltées ou non.",
  //           "timeToRead": 5,
  //           "likes": 0,
  //           "image": "https://firebasestorage.googleapis.com/v0/b/artini-2.appspot.com/o/Articles%2FWhiskey.jpg?alt=media&token=3e3e3e3e-3e3e-3e3e-3e3e-3e3e3e3e3e3e"
  //         }
  //       },
  //       "title": "Skills",
  //       "icon": "construct"
  //     },
  //     "Alcohol":
  //     {
  //       "Articles":
  //       {
  //         "Vodka":
  //         {
  //           "likes": 0, "title": "Vodka",
  //           "image": "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //           "description": "La vodka est une eau-de-vie obtenue par distillation de céréales maltées ou non.",
  //           "nbPages": 3,
  //           "timeToRead": 5
  //         },
  //         "Rhum": {
  //           "nbPages": 3,
  //           "description": "Le rhum est une eau-de-vie obtenue par distillation de céréales maltées ou non.",
  //           "title": "Rhum",
  //           "image": "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //           "likes": 0,
  //           "timeToRead": 5
  //         },
  //         "Martini": {
  //           "title": "Martini",
  //           "timeToRead": 5,
  //           "likes": 0,
  //           "image": "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //           "nbPages": 3,
  //           "description": "Le martini est un cocktail à base de gin et de vermouth, servi avec une olive ou un zeste de citron."
  //         },
  //         "Whiskey": { "nbPages": 3, "image": "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "timeToRead": 5, "title": "Whiskey", "likes": 0, "description": "Le whisky est une eau-de-vie obtenue par distillation de céréales maltées ou non." }, "Tequilla": {
  //           "image": "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  //           "title": "Tequilla",
  //           "likes": 0,
  //           "timeToRead": 5,
  //           "nbPages": 3,
  //           "description": "La tequila est une boisson alcoolisée mexicaine fabriquée à partir de l'agave bleu."
  //         }
  //       }, "icon": "wine", "title": "Alcohol"
  //     }
  //   });
  // }
  // setNewData();

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

          <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />}>
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