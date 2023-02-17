import styled from '@emotion/styled';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

const Container = styled('div')`
  background-color: #ff0000;
  padding: 1rem;
`;

export const ErrorBoundary = () => {
  const error = useRouteError();

  return isRouteErrorResponse(error) ? (
    <Container>
      <h1>{`${error.status} - ${error.data}`}</h1>
    </Container>
  ) : (
    <Container>
      <p>[ErrorBoundary]: There was an error: {(error as Error).message}</p>
    </Container>
  );
};
