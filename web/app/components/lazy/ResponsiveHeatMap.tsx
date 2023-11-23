import type { DefaultHeatMapDatum, HeatMapDatum, HeatMapSvgProps } from '@nivo/heatmap';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { useIsClient } from '~/hooks/useIsClient';

const ResponsiveHeatMapBox = <Datum extends HeatMapDatum = DefaultHeatMapDatum, ExtraProps extends object = Record<string, never>>(
  props: Omit<HeatMapSvgProps<Datum, ExtraProps>, 'width' | 'height'>,
) => {
  const isClient = useIsClient();
  return <>{isClient && <ResponsiveHeatMap {...props} />}</>;
};

export default ResponsiveHeatMapBox;
