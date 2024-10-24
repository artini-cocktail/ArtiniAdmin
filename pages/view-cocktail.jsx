import { Helmet } from 'react-helmet-async';

import { CocktailView } from 'src/sections/view-cocktail';

// ----------------------------------------------------------------------

export default function ViewCocktailPage() {
    return (
        <>
            <Helmet>
                <title> View Cocktail | Minimal UI </title>
            </Helmet>

            <CocktailView />
        </>
    );
}
