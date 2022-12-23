import styled from '@emotion/styled';
import { useCatch } from '@remix-run/react';

const Container = styled('div')`
  background-color: #ff0000;
  padding: 1rem;
`;

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Container>
      <p>
        [CatchBoundary]: {caught.status} {caught.statusText}
      </p>
    </Container>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Container>
      <p>[ErrorBoundary]: There was an error: {error.message}</p>
    </Container>
  );
}
