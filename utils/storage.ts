import AsyncStorage from '@react-native-async-storage/async-storage';

const RECEIPTS_KEY = 'receipts';

export interface Receipt {
  id: string;
  vendor_name?: string;
  total_amount?: number;
  tax?: number;
  date?: string;
  category?: string;
  createdAt: string;
}

export const saveReceipt = async (draft: Omit<Receipt, 'id' | 'createdAt'>): Promise<Receipt> => {
  const current = await getReceipts();
  const next: Receipt = {
    id: Date.now().toString(),
    ...draft,
    createdAt: new Date().toISOString(),
  };
  current.unshift(next);
  await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(current));
  return next;
};

export const getReceipts = async (): Promise<Receipt[]> => {
  const raw = await AsyncStorage.getItem(RECEIPTS_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const deleteReceipt = async (id: string): Promise<void> => {
  const current = await getReceipts();
  const filtered = current.filter((r) => r.id !== id);
  await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(filtered));
};
