import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// import { products } from 'src/_mock/products';
import { db } from 'src/services/firebase';

import ProductCard from '../product-card';
// import ProductSort from '../product-sort';
// import ProductFilters from '../product-filters';
import ProductTableToolbar from '../products-toolbar';

// ----------------------------------------------------------------------

export default function ProductsView() {
  // const [openFilter, setOpenFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredModules, setFilteredModules] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const productsCollectionRef = collection(db, "cocktails");
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => {
        const productData = doc.data();
        return {
          ...productData,
          id: doc.id, // Ajoutez l'ID ici, après la décomposition
        };
      });
      setFilteredModules(productsData);
      setModules(productsData);
    });

    return () => {
      unsubscribe();
    }
  }, []);


  // const handleOpenFilter = () => {
  //   setOpenFilter(true);
  // };

  // const handleCloseFilter = () => {
  //   setOpenFilter(false);
  // };

  const searchFilter = (event) => {
    setSearch(event.target.value)
    const searchValue = event.target.value.toLowerCase();
    const filterItems = modules.filter((product) => {
      const productName = product.name.toLowerCase();
      return productName.includes(searchValue);
    });
    setFilteredModules(filterItems);
  }


  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Products
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-start"
        sx={{ mb: 5 }}
      >
        <ProductTableToolbar
          numSelected={0}
          filterName={search}
          onFilterName={searchFilter}
        />
        {/* <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}> 
          <ProductFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
          /> 
          <ProductSort /> 
        </Stack> */}
      </Stack>

      <Grid container spacing={3}>
        {filteredModules.map((product) => (
          <Grid key={product.id} xs={12} sm={6} md={3}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

    </Container >
  );
}
