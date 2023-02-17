import { Card, styled, Typography } from '@mui/joy';

export { ErrorBoundary } from '~/components/ErrorBoundary';

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: 'auto 1fr',
  padding: theme.spacing(2),
  height: '100vh',
  gap: theme.spacing(2),
}));

export default function Index() {
  return (
    <Grid>
      <Card sx={{ gridColumn: 'span 2' }}>
        <Typography level='h1' textAlign='center'>
          Stat
        </Typography>
      </Card>
    </Grid>
  );
}
