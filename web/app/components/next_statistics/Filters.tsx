import { Button, Card, FormControl, FormLabel, Input, Stack } from '@mui/joy';
import { Form } from '@remix-run/react';

export type FiltersProps = {
  dateGte: string;
  dateLte: string;
};

export const Filters = ({ dateGte, dateLte }: FiltersProps) => {
  return (
    <Card>
      <Stack component={Form} direction={{ xs: 'column', sm: 'row' }} gap={1}>
        <FormControl id='gte' required sx={{ flex: 1 }}>
          <FormLabel id='gte-label'>From date</FormLabel>
          <Input defaultValue={dateGte} name='gte' type='date' />
        </FormControl>
        <FormControl id='lte' required sx={{ flex: 1 }}>
          <FormLabel id='lte-label'>To date</FormLabel>
          <Input defaultValue={dateLte} name='lte' type='date' />
        </FormControl>
        <Button sx={{ height: 40, mt: 'auto' }} type='submit'>
          Update
        </Button>
      </Stack>
    </Card>
  );
};
