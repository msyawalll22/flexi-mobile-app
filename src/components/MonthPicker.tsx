import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string; // YYYY-MM
  onChange: (month: string) => void;
};

function buildMonths(count = 12): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    const label = d.toLocaleDateString('ms-MY', {
      month: 'long',
      year: 'numeric',
    });
    out.push({ key, label });
  }
  return out;
}

function formatLabel(value: string): string {
  const [y, m] = value.split('-').map(Number);
  if (!y || !m) return value;
  return new Date(y, m - 1, 1).toLocaleDateString('ms-MY', {
    month: 'long',
    year: 'numeric',
  });
}

export default function MonthPicker({ value, onChange }: Props) {
  const { colors, brand, radius } = useTheme();
  const [open, setOpen] = useState(false);
  const months = useMemo(() => buildMonths(12), []);

  const label = formatLabel(value);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.trigger,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.triggerText, { color: colors.text }]}>📅 {label}</Text>
        <Text style={{ color: colors.textSecondary }}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                borderTopLeftRadius: radius.xxl,
                borderTopRightRadius: radius.xxl,
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.text }]}>Pilih Bulan</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {months.map((m) => {
                const active = m.key === value;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => {
                      onChange(m.key);
                      setOpen(false);
                    }}
                    style={[
                      styles.row,
                      {
                        backgroundColor: active
                          ? brand.primaryLight + '20'
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rowText,
                        {
                          color: active ? brand.primaryLight : colors.text,
                          fontWeight: active ? '800' : '500',
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                    {active && (
                      <Text style={{ color: brand.primaryLight }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  triggerText: { fontSize: 13, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: 24, paddingBottom: 36 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  rowText: { fontSize: 14 },
});