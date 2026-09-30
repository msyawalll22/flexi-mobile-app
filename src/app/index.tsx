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
import MonthPicker from '@/components/MonthPicker';
import SwipeableRow from '@/components/SwipeableRow';
import { formatRM } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/useStore';

export default function HomeScreen() {
  const { colors, brand, isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const commitments = useStore((s) => s.commitments);
  const debts = useStore((s) => s.debts);
  const addCommitment = useStore((s) => s.addCommitment);
  const toggleCommitmentPaid = useStore((s) => s.toggleCommitmentPaid);
  const deleteCommitment = useStore((s) => s.deleteCommitment);

  const modalRef = useRef<BottomSheetModal>(null);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDebtId, setFormDebtId] = useState<string | null>(null);

  const monthCommitments = commitments.filter((c) => c.month === currentMonth);
  const totalMonth = monthCommitments.reduce((s, c) => s + c.amount, 0);
  const totalPaid = monthCommitments
    .filter((c) => c.isPaid)
    .reduce((s, c) => s + c.amount, 0);
  const progress = totalMonth > 0 ? (totalPaid / totalMonth) * 100 : 0;

  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('ms-MY', {
    month: 'long',
    year: 'numeric',
  });

  const openModal = () => {
    setFormName('');
    setFormAmount('');
    setFormDebtId(null);
    modalRef.current?.present();
  };

  const closeModal = () => modalRef.current?.dismiss();

  const handleAdd = () => {
    if (!formName.trim() || !formAmount.trim()) {
      Alert.alert('Ralat', 'Sila isi nama dan jumlah.');
      return;
    }
    addCommitment({
      month: currentMonth,
      name: formName,
      amount: parseFloat(formAmount) || 0,
      isPaid: false,
      debtId: formDebtId,
    });
    setFormName('');
    setFormAmount('');
    setFormDebtId(null);
    closeModal();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Komitmen', `Padam "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteCommitment(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={brand.primary} />

      <View style={[styles.header, { backgroundColor: brand.primary }]}>
        <View>
          <Text style={styles.headerLabel}>Bulan Semasa</Text>
          <Text style={styles.headerTitle}>{monthLabel}</Text>
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
            Jumlah Komitmen Bulan Ini
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            {formatRM(totalMonth)}
          </Text>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: brand.accent },
              ]}
            />
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summarySub, { color: colors.textSecondary }]}>
              Dibayar: {formatRM(totalPaid)}
            </Text>
            <Text style={[styles.summarySub, { color: colors.textSecondary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

        <MonthPicker value={currentMonth} onChange={setCurrentMonth} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Senarai Komitmen ({monthCommitments.length})
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          💡 Swipe ke kiri untuk hapus
        </Text>

        {monthCommitments.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tiada komitmen bulan ini
            </Text>
          </View>
        ) : (
          monthCommitments.map((c) => (
            <SwipeableRow key={c.id} onDelete={() => handleDelete(c.id, c.name)}>
              <TouchableOpacity
                style={[
                  styles.commitCard,
                  {
                    backgroundColor: colors.card,
                    shadowOpacity: isDark ? 0.3 : 0.04,
                  },
                ]}
                onPress={() => toggleCommitmentPaid(c.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    c.isPaid && {
                      backgroundColor: brand.accent,
                      borderColor: brand.accent,
                    },
                  ]}
                >
                  {c.isPaid && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.commitName,
                      { color: colors.text },
                      c.isPaid && {
                        textDecorationLine: 'line-through',
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {c.name}
                  </Text>
                  <Text style={[styles.commitSub, { color: colors.textSecondary }]}>
                    {formatRM(c.amount)}
                    {c.debtId ? ' • 🔗 linked' : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    c.isPaid ? styles.badgePaid : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      c.isPaid ? styles.badgeTextPaid : styles.badgeTextPending,
                    ]}
                  >
                    {c.isPaid ? 'DIBAYAR' : 'BELUM'}
                  </Text>
                </View>
              </TouchableOpacity>
            </SwipeableRow>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <FormModal
        ref={modalRef}
        onClose={closeModal}
        title="Tambah Komitmen"
        subtitle={monthLabel}
      >
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Nama Komitmen
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={formName}
          onChangeText={setFormName}
          placeholder="cth: Bil Elektrik"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Jumlah (RM)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={formAmount}
          onChangeText={setFormAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Link ke Hutang (optional)
        </Text>
        <View style={styles.debtPicker}>
          <TouchableOpacity
            onPress={() => setFormDebtId(null)}
            style={[
              styles.debtChip,
              {
                backgroundColor:
                  formDebtId === null ? brand.primaryLight + '20' : colors.background,
                borderColor: formDebtId === null ? brand.primaryLight : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.debtChipText,
                {
                  color:
                    formDebtId === null ? brand.primaryLight : colors.textSecondary,
                },
              ]}
            >
              Tiada
            </Text>
          </TouchableOpacity>
          {debts.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setFormDebtId(d.id)}
              style={[
                styles.debtChip,
                {
                  backgroundColor:
                    formDebtId === d.id ? d.color + '20' : colors.background,
                  borderColor: formDebtId === d.id ? d.color : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.debtChipText,
                  {
                    color: formDebtId === d.id ? d.color : colors.textSecondary,
                  },
                ]}
              >
                {d.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[
              styles.modalBtn,
              {
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
              },
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
  progressBg: { height: 8, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summarySub: { fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  hint: { fontSize: 11, marginBottom: 12, fontStyle: 'italic' },
  commitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  commitName: { fontSize: 14, fontWeight: '600' },
  commitSub: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgePaid: { backgroundColor: '#D1FAE5' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  badgeTextPaid: { color: '#065F46' },
  badgeTextPending: { color: '#92400E' },
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
  debtPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  debtChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  debtChipText: { fontSize: 12, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});