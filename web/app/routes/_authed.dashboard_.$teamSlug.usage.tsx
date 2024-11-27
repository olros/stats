import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { ensureIsTeamMember } from '~/auth.server';
import type { Usage } from '~/utils_usage.server';
import { getTeamUsage } from '~/utils_usage.server';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';
import { Progress } from '~/components/ui/progress';
import { Alert } from '~/components/ui/alert';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  return { usage: await getTeamUsage(params.teamSlug) };
};

export const UsageDisplay = ({ label, description, usage }: { label: string; description?: string; usage: Usage }) => {
  const percentage = (usage.count / usage.limit) * 100;
  return (
    <Card className='flex flex-col gap-2'>
      <Typography variant='h3'>{label}</Typography>
      {description && <Typography>{description}</Typography>}
      <Typography variant='large'>
        {`${Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 2 }).format(usage.count)} / ${Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(usage.limit)} (${percentage.toFixed(2)}%)`}
      </Typography>
      <Progress value={percentage} />
      {!usage.withinLimit && (
        <Alert variant='destructive'>The usage has exceeded the usage restriction, future {label.toLowerCase()} will not be stored!</Alert>
      )}
    </Card>
  );
};

export default function TeamUsage() {
  const { usage } = useLoaderData<typeof loader>();

  return (
    <>
      <Card>
        <Typography variant='h3'>Quota usage</Typography>
        <Typography>
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
