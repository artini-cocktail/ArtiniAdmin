import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function AppNewsUpdate({ title, subheader, list, loading, error, ...other }) {
  if (error) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader="Error loading data" />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Failed to load articles</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
            {list.map((news) => (
              <NewsItem key={news.id} news={news} />
            ))}
          </Stack>
        )}
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          View all
        </Button>
      </Box>
    </Card>
  );
}

AppNewsUpdate.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

// ----------------------------------------------------------------------

function NewsItem({ news }) {
  const { image, title, description, postedAt, category, content } = news;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={title}
        src={image || '/assets/images/covers/cover_1.jpg'}
        sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: 1.5, 
          flexShrink: 0,
          objectFit: 'cover'
        }}
        onError={(e) => {
          e.target.src = '/assets/images/covers/cover_1.jpg';
        }}
      />

      <Box sx={{ minWidth: 240, flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Link color="inherit" variant="subtitle2" underline="hover" noWrap>
            {title}
          </Link>
          {category && (
            <Chip 
              label={category} 
              size="small" 
              variant="soft" 
              color="info"
              sx={{ height: 18, fontSize: 10 }}
            />
          )}
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {description || (content && `${content.substring(0, 100)}...`)}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {postedAt && fToNow(postedAt.toDate ? postedAt.toDate() : new Date(postedAt))}
      </Typography>
    </Stack>
  );
}

NewsItem.propTypes = {
  news: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    postedAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object]),
    category: PropTypes.string,
    content: PropTypes.string,
  }),
};
