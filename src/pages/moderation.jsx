import { Helmet } from 'react-helmet-async';

import { ModerationView } from 'src/sections/moderation';

// ----------------------------------------------------------------------

export default function ModerationPage() {
  return (
    <>
      <Helmet>
        <title> Moderation | Artini Admin </title>
      </Helmet>

      <ModerationView />
    </>
  );
}