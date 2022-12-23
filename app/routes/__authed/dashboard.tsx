import { Card, Typography } from '@mui/joy';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export default function Index() {
  return (
    <Card sx={{ gridColumn: 'span 2' }} variant='outlined'>
      <Typography level='h1' textAlign='center'>
        Dashboard
      </Typography>
    </Card>
  );
}
