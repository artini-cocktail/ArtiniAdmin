import { Helmet } from 'react-helmet-async';

import { createArticleView } from 'src/sections/create-article/view';

// ----------------------------------------------------------------------

export default function createArticlePage() {
    return (
        <>
            <Helmet>
                <title> Create Article Page | Minimal UI </title>
            </Helmet>

            <createArticleView />
        </>
    );
}
