import { Helmet } from 'react-helmet-async';

import { CreateCocktailView } from 'src/sections/create-cocktail';

// ----------------------------------------------------------------------

export default function createCocktailPage() {
  return (
    <>
      <Helmet>
        <title> Create Cocktail Page | Minimal UI </title>
      </Helmet>

      <CreateCocktailView />
    </>
  );
}
