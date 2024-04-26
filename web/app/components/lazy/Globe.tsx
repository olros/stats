/* eslint-disable @typescript-eslint/no-explicit-any */
// From: https://github.com/PaulieScanlon/paulie-dev-2023/blob/main/src/components/globe-all-cities.tsx
import { useIsClient } from '~/hooks/useIsClient';
import { forwardRef } from 'react';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

import geoJson from '../statistics/globe_countries.geojson.json';

const LazyGlobe = forwardRef<GlobeMethods, GlobeProps>((props, ref) => {
  const isClient = useIsClient();
  return (
    <>
      {isClient && (
        <Globe
          animateIn={true}
          atmosphereColor='#12467B'
          backgroundColor='#00000000'
          customLayerData={[...Array(500).keys()].map(() => ({
            lat: (Math.random() - 0.5) * 180,
            lng: (Math.random() - 0.5) * 360,
            alt: Math.random() * 1.4 + 0.1,
          }))}
          customThreeObject={() =>
            new THREE.Mesh(
              new THREE.SphereGeometry(0.3),
              new THREE.MeshBasicMaterial({
                color: '#12467B',
                opacity: 0.9,
                transparent: true,
              }),
            )
          }
          globeMaterial={
            new THREE.MeshPhongMaterial({
              color: '#051423',
              opacity: 0.7,
              transparent: true,
            })
          }
          hexPolygonColor={(geometry: any) => ['#2A2469', '#322A7A', '#3D338E', '#423B8F', '#4D469E', '#564EAD'][geometry.properties.abbrev_len % 6]}
          hexPolygonMargin={0.4}
          hexPolygonResolution={3}
          hexPolygonsData={geoJson.features}
          pointAltitude='altitude'
          pointColor='color'
          pointRadius='radius'
          pointsMerge={true}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ref={ref}
          rendererConfig={{ antialias: true, alpha: true }}
          showGraticules={true}
          {...props}
        />
      )}
    </>
  );
});

export default LazyGlobe;
