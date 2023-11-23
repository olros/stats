import type { TimeRangeSvgProps } from '@nivo/calendar';
import { ResponsiveTimeRange } from '@nivo/calendar';
import { useIsClient } from '~/hooks/useIsClient';

const LazyResponsiveTimeRange = (props: Omit<TimeRangeSvgProps, 'height' | 'width'>) => {
  const isClient = useIsClient();
  return <>{isClient && <ResponsiveTimeRange {...props} />}</>;
};

export default LazyResponsiveTimeRange;
