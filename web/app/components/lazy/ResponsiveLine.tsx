import type { LineSvgProps } from '@nivo/line';
import { ResponsiveLine } from '@nivo/line';
import { useIsClient } from '~/hooks/useIsClient';

const ResponsiveLineBox = (props: LineSvgProps) => {
  const isClient = useIsClient();
  return <>{isClient && <ResponsiveLine {...props} />}</>;
};

export default ResponsiveLineBox;
