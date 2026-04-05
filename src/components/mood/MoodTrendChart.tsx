import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface MoodTrendChartProps {
  data: { week: string; average: number }[];
}

const CHART_HEIGHT = 100;
const DOT_RADIUS = 4;
const STROKE_COLOR = '#8FA98B';

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
  const screenWidth = Dimensions.get('window').width - 40; // px-5 on both sides
  const chartWidth = screenWidth;

  // Filter out weeks with no data and map to coordinates
  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2;
    // Map mood level (0-5) to y (CHART_HEIGHT=bottom → 0=top)
    // avg 0 → bottom, avg 5 → top
    const clampedAvg = Math.max(0, Math.min(5, d.average));
    const y = CHART_HEIGHT - (clampedAvg / 5) * CHART_HEIGHT;
    return { x, y, hasData: d.average > 0 };
  });

  // Build smooth cubic bezier path
  const buildSmoothPath = (): string => {
    const validPoints = points.filter((p) => p.hasData);
    if (validPoints.length < 2) return '';

    let path = `M ${validPoints[0]!.x} ${validPoints[0]!.y}`;

    for (let i = 1; i < validPoints.length; i++) {
      const prev = validPoints[i - 1]!;
      const curr = validPoints[i]!;
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  const pathD = buildSmoothPath();
  const hasAnyData = points.some((p) => p.hasData);

  return (
    <View>
      {/* Chart */}
      <View style={[styles.chartContainer, { height: CHART_HEIGHT + DOT_RADIUS * 2 }]}>
        {hasAnyData ? (
          <Svg
            width={chartWidth}
            height={CHART_HEIGHT + DOT_RADIUS * 2}
            viewBox={`${-DOT_RADIUS} ${-DOT_RADIUS} ${chartWidth + DOT_RADIUS * 2} ${CHART_HEIGHT + DOT_RADIUS * 2}`}
          >
            {pathD ? (
              <Path
                d={pathD}
                fill="none"
                stroke={STROKE_COLOR}
                strokeWidth={2}
              />
            ) : null}
            {points
              .filter((p) => p.hasData)
              .map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={DOT_RADIUS}
                  fill={STROKE_COLOR}
                />
              ))}
          </Svg>
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>
              Log your mood for 7 days to reveal patterns
            </Text>
            <View style={styles.noDataBars}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.noDataBar} />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {data.map((d) => (
          <Text key={d.week} style={styles.xLabel}>
            {d.week}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    overflow: 'visible',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  xLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#908981',
  },
  noData: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2DED6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
  },
  noDataText: {
    fontSize: 13,
    color: '#908981',
    textAlign: 'center',
  },
  noDataBars: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  noDataBar: {
    width: 1,
    height: 20,
    backgroundColor: '#E2DED6',
  },
});
