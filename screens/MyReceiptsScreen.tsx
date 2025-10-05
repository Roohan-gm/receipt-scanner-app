import { useState, useEffect } from 'react';
import { View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';
import { getReceipts, deleteReceipt, Receipt } from '../utils/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MyReceiptsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const data = await getReceipts();
    setReceipts(data);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Receipt', 'Are you sure you want to delete this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(id);
          loadReceipts();
        },
      },
    ]);
  };

  const renderReceipt = ({ item }: { item: Receipt }) => (
    <Surface
      className="mx-2 mb-3 "
      elevation={1}
      style={{
        backgroundColor: '#fff',
        borderRadius:20
      }}>
      <View className="flex-row items-center justify-between px-4 py-3 gap-3">
        <View className="flex-1">
          <Text variant="bodyLarge" numberOfLines={1} className="text-slate-800">
            {item.vendor_name}
          </Text>
          <Text variant="bodySmall" className="text-slate-500">
            {item.date}
          </Text>
        </View>

        <Text variant="titleLarge" className="font-semibold text-slate-900">
          ${Number(item.total_amount).toFixed(2)}
        </Text>
      </View>

      <Card.Actions className="justify-end px-4 py-2">
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={24} color="#64748b" />
        </TouchableOpacity>
      </Card.Actions>
    </Surface>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      {receipts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="titleLarge">No receipts yet</Text>
          <Text variant="bodyMedium">Scan your first receipt to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={receipts}
          showsVerticalScrollIndicator={false}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}
