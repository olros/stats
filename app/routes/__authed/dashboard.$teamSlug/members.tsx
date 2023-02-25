import { Card, Typography } from '@mui/joy';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export default function TeamMembers() {
  return (
    <Card>
      <Typography gutterBottom level='h3'>
        Members
      </Typography>
    </Card>
  );
}
