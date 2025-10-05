import { useState, useEffect } from 'react';
import { View, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';
import { getReceipts, deleteReceipt, Receipt } from '../utils/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function MyReceiptsScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    loadReceipts();
  }, [receipts]);

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
      className="mx-2 mb-3"
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}>
      <View className="flex-row items-center justify-between gap-3 px-4 py-3">
        <View style={{ flex: 1 }}>
          <Text variant="bodyLarge" numberOfLines={1} style={{ color: '#1d293d' }}>
            {item.vendor_name}
          </Text>
          <Text variant="bodySmall" style={{ color: '#62748e' }}>
            {item.date}
          </Text>
        </View>

        <Text variant="titleLarge" style={{ color: '#3b82f6', fontWeight: '900' }}>
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
    <View style={{ flex: 1, padding: 16, backgroundColor: '#E2E2E6' }}>
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
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Receipts</Text>
            </View>
          }
          style={{ marginBottom: 60 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 10,
    marginTop: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
});
