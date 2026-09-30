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
import PieChartCard from '@/components/PieChartCard';
import SwipeableRow from '@/components/SwipeableRow';
import { formatRM } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/useStore';

const CATEGORIES = [
  { id: 'food', label: 'Makanan', emoji: '🍔', color: '#F59E0B' },
  { id: 'transport', label: 'Pengangkutan', emoji: '🚗', color: '#3B82F6' },
  { id: 'shopping', label: 'Beli-belah', emoji: '🛍️', color: '#EC4899' },
  { id: 'bills', label: 'Bil', emoji: '🧾', color: '#8B5CF6' },
  { id: 'health', label: 'Kesihatan', emoji: '💊', color: '#10B981' },
  { id: 'other', label: 'Lain-lain', emoji: '📦', color: '#64748B' },
];

export default function SpendingScreen() {
  const { colors, brand, isDark } = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const expenses = useStore((s) => s.expenses);
  const addExpense = useStore((s) => s.addExpense);
  const deleteExpense = useStore((s) => s.deleteExpense);

  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const modalRef = useRef<BottomSheetModal>(null);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('food');

  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const todayExpenses = monthExpenses.filter((e) => e.date === today);
  const totalToday = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    total: monthExpenses
      .filter((e) => e.category === cat.id)
      .reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const chartData = byCategory.map((c) => ({
    label: c.label,
    value: c.total,
    color: c.color,
    emoji: c.emoji,
  }));

  const todayLabel = new Date().toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const openModal = () => {
    setFormName('');
    setFormAmount('');
    setFormCategory('food');
    modalRef.current?.present();
  };

  const closeModal = () => modalRef.current?.dismiss();

  const handleAdd = () => {
    if (!formName.trim() || !formAmount.trim()) {
      Alert.alert('Ralat', 'Sila isi nama dan jumlah.');
      return;
    }
    addExpense({
      date: today,
      name: formName,
      amount: parseFloat(formAmount) || 0,
      category: formCategory,
    });
    setFormName('');
    setFormAmount('');
    setFormCategory('food');
    closeModal();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Perbelanjaan', `Padam "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={brand.purple} />

      <View style={[styles.header, { backgroundColor: brand.purple }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>{todayLabel}</Text>
          <Text style={styles.headerTitle}>Perbelanjaan</Text>
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
            Hari Ini
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.text }]}>
            {formatRM(totalToday)}
          </Text>
          <View style={[styles.summaryDivider, { borderTopColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summarySubLabel, { color: colors.textSecondary }]}>
                Bulan Ini
              </Text>
              <Text style={[styles.summarySubValue, { color: colors.text }]}>
                {formatRM(totalMonth)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.summarySubLabel, { color: colors.textSecondary }]}>
                Transaksi
              </Text>
              <Text style={[styles.summarySubValue, { color: colors.text }]}>
                {monthExpenses.length} item
              </Text>
            </View>
          </View>
        </View>

        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />

        {chartData.length > 0 && (
          <PieChartCard title="Breakdown Kategori" data={chartData} />
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Transaksi Bulan Ini
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          💡 Swipe ke kiri untuk hapus
        </Text>

        {monthExpenses.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💸</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada perbelanjaan bulan ini
            </Text>
          </View>
        ) : (
          monthExpenses.map((e) => {
            const cat = CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[5];
            const dateLabel = new Date(e.date).toLocaleDateString('ms-MY', {
              day: 'numeric',
              month: 'short',
            });
            return (
              <SwipeableRow key={e.id} onDelete={() => handleDelete(e.id, e.name)}>
                <View
                  style={[
                    styles.expenseCard,
                    {
                      backgroundColor: colors.card,
                      shadowOpacity: isDark ? 0.3 : 0.04,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.expenseIcon,
                      { backgroundColor: cat.color + (isDark ? '30' : '20') },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.expenseName, { color: colors.text }]}>
                      {e.name}
                    </Text>
                    <Text style={[styles.expenseCat, { color: colors.textSecondary }]}>
                      {cat.label} • {dateLabel}
                    </Text>
                  </View>
                  <Text style={[styles.expenseAmount, { color: brand.danger }]}>
                    -{formatRM(e.amount)}
                  </Text>
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
        title="Tambah Perbelanjaan"
        subtitle={todayLabel}
      >
        <Text style={[styles.inputLabel, { color: colors.text }]}>Nama</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
          ]}
          value={formName}
          onChangeText={setFormName}
          placeholder="cth: Nasi Lemak"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Jumlah (RM)
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
          ]}
          value={formAmount}
          onChangeText={setFormAmount}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <Text style={[styles.inputLabel, { color: colors.text }]}>Kategori</Text>
        <View style={styles.categoryPicker}>
          {CATEGORIES.map((cat) => {
            const active = formCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setFormCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active
                      ? cat.color + (isDark ? '30' : '20')
                      : colors.background,
                    borderColor: active ? cat.color : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: active ? cat.color : colors.textSecondary,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
            style={[styles.modalBtn, { backgroundColor: brand.purple }]}
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
  headerLabel: { color: '#DDD6FE', fontSize: 11, fontWeight: '600' },
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  hint: { fontSize: 11, marginBottom: 12, fontStyle: 'italic' },
  expenseCard: {
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
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseName: { fontSize: 14, fontWeight: '600' },
  expenseCat: { fontSize: 12, marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '800' },
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
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipText: { fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});