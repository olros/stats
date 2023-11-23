import { Button, Card, FormControl, FormLabel, Input, Option, Select, Stack } from '@mui/joy';
import { Form } from '@remix-run/react';

import type { PERIOD } from './utils';

export type FiltersProps = {
  dateGte: string;
  dateLte: string;
  period: PERIOD;
};

export const Filters = ({ dateGte, dateLte, period }: FiltersProps) => {
  return (
    <Card>
      <Stack component={Form} direction={{ xs: 'column', sm: 'row' }} gap={1}>
        <FormControl required>
          <FormLabel id='period-label'>Period</FormLabel>
          <Select defaultValue={period} name='period' slotProps={{ button: { 'aria-labelledby': 'period-label' } }}>
            <Option value='day'>Day</Option>
            <Option value='hour'>Hour</Option>
          </Select>
        </FormControl>
        <FormControl required sx={{ flex: 1 }}>
          <FormLabel id='gte-label'>From date</FormLabel>
          <Input defaultValue={dateGte} name='gte' type='date' />
        </FormControl>
        <FormControl required sx={{ flex: 1 }}>
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
