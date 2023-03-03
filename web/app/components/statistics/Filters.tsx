import { Button, Card, FormControl, FormLabel, Input, Stack, Tooltip } from '@mui/joy';
import { Form } from '@remix-run/react';

export type FiltersProps = {
  pathname: string;
  dateGte: string;
  dateLte: string;
};

export const Filters = ({ pathname, dateGte, dateLte }: FiltersProps) => {
  return (
    <Card>
      <Stack component={Form} direction={{ xs: 'column', md: 'row' }} gap={1}>
        <FormControl id='pathname' sx={{ flex: 1 }}>
          <Tooltip arrow title='Equal-matching for Trend, startswith-matching for Top pages and ignored for custom events'>
            <FormLabel id='pathname-label'>Pathname</FormLabel>
          </Tooltip>
          <Input defaultValue={pathname} name='pathname' />
        </FormControl>
        <FormControl id='gte' required sx={{ flex: 1 }}>
          <FormLabel id='gte-label'>From date</FormLabel>
          <Input defaultValue={dateGte} name='gte' type='date' />
        </FormControl>
        <FormControl id='lte' required sx={{ flex: 1 }}>
          <FormLabel id='lte-label'>To date</FormLabel>
          <Input defaultValue={dateLte} name='lte' type='date' />
        </FormControl>
        <Button sx={{ height: 40, mt: 'auto' }} type='submit'>
          Oppdater
        </Button>
      </Stack>
    </Card>
  );
};
