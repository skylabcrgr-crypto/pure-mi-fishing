/**
 * MapPinMarker.tsx
 * Custom map pin component for Pure MI Fishing's Explore map.
 *
 * Renders a styled circular pin with a coloured dot and optional
 * label — used for launch sites, fishing hotspots, and shore access
 * points on the Detroit River map.
 *
 * Wrapped in React.memo so it doesn't re-render when unrelated map
 * state changes (prevents marker flicker on zoom/pan).
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '../../design/tokens';

export type MapPinType = 'launch' | 'hotspot' | 'access' | 'hazard';

interface MapPinMarkerProps {
  /** Pin category — controls colour. */
  type: MapPinType;
  /** Short label shown below the dot (e.g. "Wyandotte"). */
  label?: string;
  /** Scale 0.7–1.3, default 1.  Use >1 for featured/selected pin. */
  scale?: number;
}

const PIN_COLORS: Record<MapPinType, string> = {
  launch:  Colors.map.launch,
  hotspot: Colors.map.hotspot,
  access:  Colors.map.access,
  hazard:  Colors.map.hazard,
};

function MapPinMarker({ type, label, scale = 1 }: MapPinMarkerProps) {
  const color = PIN_COLORS[type];
  const size  = Math.round(18 * scale);

  return (
    <View style={styles.wrapper} accessibilityRole="image">
      {/* Outer ring */}
      <View
        style={[
          styles.outer,
          {
            width:  size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: color,
          },
        ]}
      >
        {/* Inner dot */}
        <View
          style={[
            styles.inner,
            {
              width:  size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {/* Optional label */}
      {label ? (
        <View style={[styles.labelContainer, { borderColor: color }]}>
          <Text
            style={[styles.label, { color }]}
            numberOfLines={1}
            accessibilityLabel={label}
          >
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default memo(MapPinMarker);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,22,40,0.75)',
    borderWidth: 2,
  },
  inner: {
    // size & border-radius set inline
  },
  labelContainer: {
    marginTop: 3,
    backgroundColor: 'rgba(10,22,40,0.85)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  label: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
  },
});
