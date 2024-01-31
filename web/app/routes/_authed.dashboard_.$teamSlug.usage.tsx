import { Alert, Card, LinearProgress, Stack, Typography } from '@mui/joy';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import type { Usage } from '~/utils_usage.server';
import { getTeamUsage } from '~/utils_usage.server';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  return jsonHash({ usage: getTeamUsage(params.teamSlug) });
};

export const UsageDisplay = ({ label, description, usage }: { label: string; description?: string; usage: Usage }) => {
  const percentage = (usage.count / usage.limit) * 100;
  return (
    <Card sx={{ gap: 1 }}>
      <Typography level='h3'>{label}</Typography>
      {description && <Typography level='body-md'>{description}</Typography>}
      <Stack direction='row' gap={1}>
        <Typography level='body-md' textColor='common.white'>
          0
        </Typography>
        <LinearProgress color={usage.withinLimit ? 'success' : 'warning'} determinate thickness={24} value={percentage} variant='outlined'>
          <Typography level='body-md' sx={{ mixBlendMode: 'difference' }} textColor='common.white'>
            {`${Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 2 }).format(usage.count)} (${percentage.toFixed(2)}%)`}
          </Typography>
        </LinearProgress>
        <Typography level='body-md' textColor='common.white'>
          {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(usage.limit)}
        </Typography>
      </Stack>
      {!usage.withinLimit && <Alert color='danger'>The usage has exceeded the usage restriction, future {label.toLowerCase()} will not be stored!</Alert>}
    </Card>
  );
};

export default function TeamUsage() {
  const { usage } = useLoaderData<typeof loader>();

  return (
    <>
      <Card sx={{ gap: 1 }}>
        <Typography level='h3'>Quota usage</Typography>
        <Typography level='body-lg'>
          The quota usage is measured per team aggregated across all the team's projects. The usage is measured as rows stored in the database. Each team can
          have as many projects as needed, but the quota don't increase with each project. If you reach the quota, requests will still respond with a 202-status
          in order to not break your applications, but the data will not be persisted to the database.
        </Typography>
      </Card>
      <UsageDisplay description='Pageviews registered' label='Pageviews' usage={usage.pageViewsNext} />
      <UsageDisplay
        description='Since custom events are aggregated when stored in the database, the usage seen here will probably be lower than the number of custom events seen in your projects'
        label='Custom events'
        usage={usage.customEvents}
      />
    </>
  );
}
