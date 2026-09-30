import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FormModal from '@/components/FormModal';
import PieChartCard from '@/components/PieChartCard';
import SwipeableRow from '@/components/SwipeableRow';
import { formatRM } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/useStore';

export default function DebtsScreen() {
  const { colors, brand, isDark } = useTheme();
  const debts = useStore((s) => s.debts);
  const addDebt = useStore((s) => s.addDebt);
  const deleteDebt = useStore((s) => s.deleteDebt);

  const modalRef = useRef<BottomSheetModal>(null);
  const [formName, setFormName] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formMonthly, setFormMonthly] = useState('');

  const totalDebt = debts.reduce((s, d) => s + d.totalBalance, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.monthly, 0);

  const chartData = debts.map((d) => ({
    label: d.name,
    value: d.totalBalance,
    color: d.color,
  }));

  const openModal = () => {
    setFormName('');
    setFormTotal('');
    setFormBalance('');
    setFormMonthly('');
    modalRef.current?.present();
  };

  const closeModal = () => modalRef.current?.dismiss();

  const handleAdd = () => {
    if (!formName.trim() || !formBalance.trim()) {
      Alert.alert('Ralat', 'Sila isi nama dan baki hutang.');
      return;
    }
    const balance = parseFloat(formBalance) || 0;
    const original = parseFloat(formTotal) || balance;
    const palette = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#EC4899'];
    addDebt({
      name: formName,
      totalBalance: balance,
      originalAmount: original,
      monthly: parseFloat(formMonthly) || 0,
      color: palette[debts.length % palette.length],
    });
    setFormName('');
    setFormTotal('');
    setFormBalance('');
    setFormMonthly('');
    closeModal();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Hutang', `Padam "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteDebt(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={brand.primary} />

      <View style={[styles.header, { backgroundColor: brand.primary }]}>
        <View>
          <Text style={styles.headerLabel}>Pengurusan</Text>
          <Text style={styles.headerTitle}>Senarai Hutang</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, shadowOpacity: isDark ? 0.3 : 0.08 },
          ]}
        >
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Jumlah Baki Hutang
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            {formatRM(totalDebt)}
          </Text>
          <View style={[styles.summaryDivider, { borderTopColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summarySubLabel, { color: colors.textSecondary }]}>
                Komitmen Bulanan
              </Text>
              <Text style={[styles.summarySubValue, { color: colors.text }]}>
                {formatRM(totalMonthly)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.summarySubLabel, { color: colors.textSecondary }]}>
                Bilangan Hutang
              </Text>
              <Text style={[styles.summarySubValue, { color: colors.text }]}>
                {debts.length} akaun
              </Text>
            </View>
          </View>
        </View>

        {debts.length > 0 && (
          <PieChartCard title="Breakdown Hutang" data={chartData} />
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Semua Hutang</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          💡 Swipe ke kiri untuk hapus
        </Text>

        {debts.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tiada hutang — tahniah!
            </Text>
          </View>
        ) : (
          debts.map((d) => {
            const pct = d.originalAmount
              ? ((d.originalAmount - d.totalBalance) / d.originalAmount) * 100
              : 0;
            const paid = d.originalAmount - d.totalBalance;

            return (
              <SwipeableRow key={d.id} onDelete={() => handleDelete(d.id, d.name)}>
                <View
                  style={[
                    styles.debtCard,
                    {
                      backgroundColor: colors.card,
                      shadowOpacity: isDark ? 0.3 : 0.05,
                    },
                  ]}
                >
                  <View style={styles.debtTop}>
                    <View
                      style={[
                        styles.debtIcon,
                        { backgroundColor: d.color + (isDark ? '30' : '20') },
                      ]}
                    >
                      <Text style={[styles.debtIconText, { color: d.color }]}>
                        {d.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.debtName, { color: colors.text }]}>{d.name}</Text>
                      <Text style={[styles.debtSub, { color: colors.textSecondary }]}>
                        {formatRM(d.monthly)} / bulan
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.debtBalance, { color: colors.text }]}>
                        {formatRM(d.totalBalance)}
                      </Text>
                      <Text style={[styles.debtPctSmall, { color: colors.textSecondary }]}>
                        {Math.round(pct)}% selesai
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.debtProgressBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.debtProgressFill,
                        { width: `${Math.min(pct, 100)}%`, backgroundColor: d.color },
                      ]}
                    />
                  </View>

                  <View style={styles.debtFooter}>
                    <Text style={[styles.debtFooterText, { color: colors.textSecondary }]}>
                      Asal: {formatRM(d.originalAmount)}
                    </Text>
                    <Text style={[styles.debtFooterText, { color: colors.textSecondary }]}>
                      Bayar: {formatRM(paid)}
                    </Text>
                  </View>
                </View>
              </SwipeableRow>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <FormModal
        ref={modalRef}
        onClose={closeModal}
        title="Tambah Hutang"
        subtitle="Isi maklumat hutang baru"
      >
        <Text style={[styles.inputLabel, { color: colors.text }]}>Nama Hutang</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
          ]}
          value={formName}
          onChangeText={setFormName}
          placeholder="cth: Ansuran Motor"
          placeholderTextColor={colors.textSecondary}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Jumlah Asal (RM)
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              value={formTotal}
              onChangeText={setFormTotal}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Baki Semasa (RM)
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
              ]}
              value={formBalance}
              onChangeText={setFormBalance}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Bayaran Bulanan (RM)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
          ]}
          value={formMonthly}
          onChangeText={setFormMonthly}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[
              styles.modalBtn,
              { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
            ]}
            onPress={closeModal}
          >
            <Text style={[styles.cancelBtnText, { color: colors.text }]}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: brand.primary }]}
            onPress={handleAdd}
          >
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </FormModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLabel: { color: '#BFDBFE', fontSize: 12, fontWeight: '600' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 2 },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  scroll: { padding: 16, paddingTop: 20 },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: -36,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  summaryLabel: { fontSize: 13, fontWeight: '500' },
  summaryAmount: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  summaryDivider: { borderTopWidth: 1, marginTop: 16, paddingTop: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summarySubLabel: { fontSize: 11, fontWeight: '600' },
  summarySubValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  hint: { fontSize: 11, marginBottom: 12, fontStyle: 'italic' },
  debtCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  debtTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  debtIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  debtIconText: { fontWeight: '800', fontSize: 18 },
  debtName: { fontSize: 15, fontWeight: '700' },
  debtSub: { fontSize: 12, marginTop: 2 },
  debtBalance: { fontSize: 15, fontWeight: '800' },
  debtPctSmall: { fontSize: 10, marginTop: 2 },
  debtProgressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  debtProgressFill: { height: '100%', borderRadius: 3 },
  debtFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  debtFooterText: { fontSize: 11, fontWeight: '500' },
  emptyBox: {
    padding: 32,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyText: { fontSize: 13 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});