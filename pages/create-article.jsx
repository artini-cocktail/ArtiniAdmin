import { Helmet } from 'react-helmet-async';

import { CreateArticleView } from 'src/sections/create-article/view';

// ----------------------------------------------------------------------

export default function createArticlePage() {
    return (
        <>
            <Helmet>
                <title> Create Article Page | Minimal UI </title>
            </Helmet>

            <CreateArticleView />
        </>
    );
}
