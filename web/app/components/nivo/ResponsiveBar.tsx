import { BarDatum, ResponsiveBar, ResponsiveBarSvgProps } from '@nivo/bar';
import { useIsClient } from '~/hooks/useIsClient';

const ResponsiveBarBox = <RawDatum extends BarDatum>(props: ResponsiveBarSvgProps<RawDatum>) => {
  const isClient = useIsClient();
  return <>{isClient && <ResponsiveBar {...props} />}</>;
};

export default ResponsiveBarBox;
