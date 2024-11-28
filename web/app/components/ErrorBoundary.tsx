import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { Typography } from './typography';
import { Card } from './ui/card';

export const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <Card className='bg-red-500'>
      <Typography variant='h3'>Something went wrong</Typography>
      {isRouteErrorResponse(error) ? (
        <Typography>{`${error.status} - ${error.data}`}</Typography>
      ) : error instanceof Error ? (
        <>
          <Typography>{`${error.name}: ${error.message}`}</Typography>
          {process.env.NODE_ENV !== 'production' && (
            <Card>
              <Typography variant='small'>Stack:</Typography>
              <Typography variant='small' className='mt-2 font-mono whitespace-break-spaces'>
                {error.stack}
              </Typography>
            </Card>
          )}
        </>
      ) : (
        <Typography>Unknown error</Typography>
      )}
    </Card>
  );
};
