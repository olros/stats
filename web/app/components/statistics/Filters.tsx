import { Form } from '@remix-run/react';
import { stats } from '~/stats';

import type { PERIOD } from './utils';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

export type FiltersProps = {
  dateGte: string;
  dateLte: string;
  period: PERIOD;
};

export const Filters = ({ dateGte, dateLte, period }: FiltersProps) => {
  return (
    <Card>
      <Form className='grid sm:grid-flow-col sm:grid-cols-[auto_1fr_1fr_auto] sm:grid-rows-[auto_1fr] gap-2' onSubmit={() => stats.event('update-filters')}>
        <Label htmlFor='period'>Period</Label>
        <Select name='period' defaultValue={period}>
          <SelectTrigger className='min-w-20' id='period'>
            <SelectValue placeholder='Period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='day'>Day</SelectItem>
            <SelectItem value='hour'>Hour</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor='gte'>From date</Label>
        <Input id='gte' className='flex-1' required defaultValue={dateGte} name='gte' type='date' />
        <Label htmlFor='lte'>To date</Label>
        <Input id='lte' className='flex-1' required defaultValue={dateLte} name='lte' type='date' />
        <Button className='mt-auto h-10 row-span-2' type='submit'>
          Update
        </Button>
      </Form>
    </Card>
  );
};
