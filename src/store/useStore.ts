import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Commitment = {
  id: string;
  month: string;
  name: string;
  amount: number;
  isPaid: boolean;
  debtId?: string | null;
};

export type Debt = {
  id: string;
  name: string;
  totalBalance: number;
  originalAmount: number;
  monthly: number;
  color: string;
};

export type Expense = {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string;
};

type State = {
  commitments: Commitment[];
  debts: Debt[];
  expenses: Expense[];
  hydrated: boolean;

  addCommitment: (c: Omit<Commitment, 'id'>) => void;
  toggleCommitmentPaid: (id: string) => void;
  deleteCommitment: (id: string) => void;

  addDebt: (d: Omit<Debt, 'id'>) => void;
  deleteDebt: (id: string) => void;

  addExpense: (e: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  setHydrated: (v: boolean) => void;
  resetAll: () => void;
};

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      commitments: [
        { id: 'c1', month: '2026-10', name: 'Ansuran Kereta (Okt)', amount: 500, isPaid: false, debtId: 'd1' },
        { id: 'c2', month: '2026-10', name: 'Personal Loan (Okt)', amount: 300, isPaid: false, debtId: 'd2' },
        { id: 'c3', month: '2026-10', name: 'Internet Unifi', amount: 129, isPaid: true, debtId: null },
      ],
      debts: [
        { id: 'd1', name: 'Ansuran Kereta', totalBalance: 30000, originalAmount: 45000, monthly: 500, color: '#3B82F6' },
        { id: 'd2', name: 'Personal Loan', totalBalance: 10000, originalAmount: 15000, monthly: 300, color: '#8B5CF6' },
        { id: 'd3', name: 'Kad Kredit Maybank', totalBalance: 2500, originalAmount: 5000, monthly: 200, color: '#EF4444' },
      ],
      expenses: [
        { id: 'e1', date: new Date().toISOString().split('T')[0], name: 'Nasi Lemak', amount: 5.5, category: 'food' },
        { id: 'e2', date: new Date().toISOString().split('T')[0], name: 'Grab ke Office', amount: 12, category: 'transport' },
      ],
      hydrated: false,

      addCommitment: (c) =>
        set((s) => ({ commitments: [...s.commitments, { ...c, id: uid() }] })),

      toggleCommitmentPaid: (id) => {
        const commitment = get().commitments.find((c) => c.id === id);
        if (!commitment) return;

        set((s) => ({
          commitments: s.commitments.map((c) =>
            c.id === id ? { ...c, isPaid: !c.isPaid } : c,
          ),
        }));

        if (commitment.debtId) {
          const delta = commitment.isPaid ? commitment.amount : -commitment.amount;
          set((s) => ({
            debts: s.debts.map((d) =>
              d.id === commitment.debtId
                ? { ...d, totalBalance: Math.max(0, d.totalBalance + delta) }
                : d,
            ),
          }));
        }
      },

      deleteCommitment: (id) =>
        set((s) => ({ commitments: s.commitments.filter((c) => c.id !== id) })),

      addDebt: (d) => set((s) => ({ debts: [...s.debts, { ...d, id: uid() }] })),

      deleteDebt: (id) =>
        set((s) => ({
          debts: s.debts.filter((d) => d.id !== id),
          commitments: s.commitments.filter((c) => c.debtId !== id),
        })),

      addExpense: (e) =>
        set((s) => ({ expenses: [{ ...e, id: uid() }, ...s.expenses] })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      setHydrated: (v) => set({ hydrated: v }),

      resetAll: () => set({ commitments: [], debts: [], expenses: [] }),
    }),
    {
      name: 'flexi-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);