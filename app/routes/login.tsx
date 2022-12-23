import { Button, Stack } from '@mui/joy';
import { Form } from '@remix-run/react';

export default function Login() {
  return (
    <Stack action='/auth/github' component={Form} justifyContent='center' method='post' sx={{ height: '100vh' }}>
      <Button sx={{ margin: 'auto' }} type='submit'>
        Login with GitHub
      </Button>
    </Stack>
  );
}
