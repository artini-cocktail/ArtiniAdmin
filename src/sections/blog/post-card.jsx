import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// import red color from '@mui/material/colors/red';
import { red } from '@mui/material/colors';

import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import { fCurrency } from 'src/utils/format-number';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function PostCard({ post }) {
  console.log(post);

  const renderImg = (
    <Box
      component="img"
      alt={post?.title}
      src={post?.image}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );
  return (
    <Card onClick={() => { window.location.href = `/create-article?id=${post?.id}`; }} style={{ cursor: 'pointer' }}>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {post?.title}
        </Link>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FavoriteIcon fontSize="small" sx={{ color: red[500] }} />
            <Typography variant="subtitle2">{post?.likes}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <VisibilityIcon fontSize="small" />
            <Typography variant="subtitle2">{post?.timeToRead}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.object,
};
