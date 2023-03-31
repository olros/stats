import { Alert, Card, LinearProgress, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import type { Usage } from '~/utils_usage.server';
import { getTeamUsage } from '~/utils_usage.server';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const usage = await getTeamUsage(params.teamSlug);

  return json({ usage });
};

export const UsageDisplay = ({ label, description, usage }: { label: string; description?: string; usage: Usage }) => {
  const percentage = (usage.count / usage.limit) * 100;
  return (
    <Card sx={{ gap: 1 }}>
      <Typography level='h3'>{label}</Typography>
      {description && <Typography level='body2'>{description}</Typography>}
      <Stack direction='row' gap={1}>
        <Typography level='body2' textColor='common.white'>
          0
        </Typography>
        <LinearProgress color={usage.withinLimit ? 'success' : 'warning'} determinate thickness={24} value={percentage} variant='outlined'>
          <Typography level='body2' sx={{ mixBlendMode: 'difference' }} textColor='common.white'>
            {`${Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 2 }).format(usage.count)} (${percentage.toFixed(2)}%)`}
          </Typography>
        </LinearProgress>
        <Typography level='body2' textColor='common.white'>
          {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(usage.limit)}
        </Typography>
      </Stack>
      {!usage.withinLimit && <Alert color='danger'>The usage has exceeded the usage restriction, future {label.toLowerCase()} will not be stored!</Alert>}
    </Card>
  );
};

export default function TeamMembers() {
  const { usage } = useLoaderData<typeof loader>();

  return (
    <>
      <Card sx={{ gap: 1 }}>
        <Typography level='h3'>Quota usage</Typography>
        <Typography level='body1'>
          The quota usage is measured per team aggregated across all the team's projects. The usage is measured as rows stored in the database. Each team can
          have as many projects as needed, but the quota don't increase with each project. If you reach the quota, requests will still respond with a 202-status
          in order to not break your applications, but the data will not be persisted to the database.
        </Typography>
      </Card>
      <UsageDisplay
        description='Since pageviews are aggregated when stored in the database, the usage seen here will probably be lower than the number of pageviews seen in your projects'
        label='Pageviews'
        usage={usage.pageViews}
      />
      <UsageDisplay
        description='Since unique visitors are stored with a hash per visitor per day in the database, the usage seen here will probably be higher than the number of unique visitors seen in your projects'
        label='Unique visitors'
        usage={usage.pageVisitors}
      />
      <UsageDisplay
        description='Since custom events are aggregated when stored in the database, the usage seen here will probably be lower than the number of custom events seen in your projects'
        label='Custom events'
        usage={usage.customEvents}
      />
    </>
  );
}
