import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

type Props = {
  label: string;
  amount: string;
  progress?: number;
  leftLabel?: string;
  leftValue?: string;
  rightLabel?: string;
  rightValue?: string;
  onProgressLabel?: string;
};

export default function SummaryCard({
  label,
  amount,
  progress,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  onProgressLabel,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{amount}</Text>

      {progress !== undefined && (
        <>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.subText}>{onProgressLabel}</Text>
            <Text style={styles.subText}>{Math.round(progress)}%</Text>
          </View>
        </>
      )}

      {(leftLabel || rightLabel) && (
        <View style={styles.divider} />
      )}

      {leftLabel && rightLabel && (
        <View style={styles.row}>
          <View>
            <Text style={styles.subLabel}>{leftLabel}</Text>
            <Text style={styles.subValue}>{leftValue}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.subLabel}>{rightLabel}</Text>
            <Text style={styles.subValue}>{rightValue}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginTop: -36,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  amount: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 6 },
  progressBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  subText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  subLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  subValue: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 16,
    paddingTop: 16,
  },
});