import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { formatRM } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Slice = { label: string; value: number; color: string; emoji?: string };

type Props = {
  title: string;
  data: Slice[];
  size?: number;
};

export default function PieChartCard({ title, data, size = 140 }: Props) {
  const { colors, isDark } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2;
  const strokeWidth = 22;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  let cumulative = 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowOpacity: isDark ? 0.3 : 0.05 },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.row}>
        <View>
          <Svg width={size} height={size}>
            <G rotation={-90} origin={`${radius}, ${radius}`}>
              <Circle
                cx={radius}
                cy={radius}
                r={innerRadius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {total > 0 &&
                data.map((slice, i) => {
                  const fraction = slice.value / total;
                  const dash = fraction * circumference;
                  const gap = circumference - dash;
                  const offset = -cumulative * circumference;
                  cumulative += fraction;
                  return (
                    <Circle
                      key={i}
                      cx={radius}
                      cy={radius}
                      r={innerRadius}
                      stroke={slice.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={offset}
                      strokeLinecap="butt"
                      fill="none"
                    />
                  );
                })}
            </G>
          </Svg>

          <View style={styles.center}>
            <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.centerValue, { color: colors.text }]}>{formatRM(total)}</Text>
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 16 }}>
          {data.slice(0, 5).map((s, i) => {
            const pct = total > 0 ? (s.value / total) * 100 : 0;
            return (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1}>
                  {s.emoji ? `${s.emoji} ` : ''}
                  {s.label}
                </Text>
                <Text style={[styles.legendPct, { color: colors.textSecondary }]}>
                  {Math.round(pct)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 15, fontWeight: '800', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { fontSize: 10, fontWeight: '600' },
  centerValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  legendPct: { fontSize: 12, fontWeight: '700' },
});