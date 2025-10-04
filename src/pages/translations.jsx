import { Helmet } from 'react-helmet-async';

import { TranslationsView } from 'src/sections/translations';

// ----------------------------------------------------------------------

export default function TranslationsPage() {
  return (
    <>
      <Helmet>
        <title> Translations | Artini Admin </title>
      </Helmet>

      <TranslationsView />
    </>
  );
}
