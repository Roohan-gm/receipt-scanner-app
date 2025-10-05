import { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Button, Text, Surface, Divider, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { extractReceiptData } from '../utils/geminiApi';
import { Receipt, saveReceipt } from '../utils/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

export default function ScanReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      setReceiptData(null);
      setImageUri(null);
      return () => {};
    }, [])
  );

  const btnTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: '#2563eb', // active background
      onPrimary: '#ffffff', // active text/icon
      onSurfaceDisabled: '#9ca3af', // disabled text/icon
      surfaceDisabled: '#ffffff', // disabled background
    },
  };

  /* ---------- permission helpers ---------- */
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  /* ---------- image pickers ---------- */
  const pickFromGallery = async () => {
    if (!(await requestGalleryPermission())) {
      Alert.alert('Permission required', 'Gallery access is needed to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    if (!(await requestCameraPermission())) {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  /* ---------- scan & save ---------- */
  const scanReceipt = async () => {
    if (!imageUri) return Alert.alert('No image', 'Please select or take a picture first.');
    setLoading(true);
    try {
      const base64 = await convertImageToBase64(imageUri);
      const data = await extractReceiptData(base64);
      const saved = await saveReceipt(data);
      setReceiptData(saved);
    } catch (err: any) {
      Alert.alert('Scan failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const res = await fetch(uri);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Receipt</Text>
      </View>
      {/* Image preview / empty state */}
      <Surface style={styles.previewCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.empty}>
            <MaterialIcons name="receipt-long" size={48} color="#cbd5e1" />
            <Text variant="bodyMedium" style={styles.emptyTxt}>
              No receipt selected
            </Text>
          </View>
        )}
      </Surface>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button
          icon="camera"
          mode="contained"
          onPress={takePhoto}
          disabled={loading}
          theme={btnTheme}
          style={styles.btn}>
          Take Photo
        </Button>

        <Button
          icon="image"
          mode="contained"
          onPress={pickFromGallery}
          disabled={loading}
          theme={btnTheme}
          style={styles.btn}>
          Gallery
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={scanReceipt}
        disabled={!imageUri || loading}
        loading={loading}
        theme={btnTheme}
        style={styles.scanBtn}>
        {loading ? 'Scanning…' : 'Scan Receipt'}
      </Button>

      {/* Result card */}
      {receiptData && (
        <Surface style={styles.resultCard} elevation={1}>
          <View style={styles.row}>
            <Text variant="bodyLarge" numberOfLines={1} style={styles.mainText}>
              {receiptData.vendor_name}
            </Text>
            <Text variant="titleMedium" style={styles.total}>
              ${Number(receiptData.total_amount).toFixed(2)}
            </Text>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={styles.metaLabel}>
              Date
            </Text>
            <Text variant="bodySmall" style={styles.metaValue}>
              {receiptData.date}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={styles.metaLabel}>
              Tax
            </Text>
            <Text variant="bodySmall" style={styles.metaValue}>
              ${Number(receiptData.tax).toFixed(2)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={styles.metaLabel}>
              Category
            </Text>
            <Text variant="bodySmall" style={[styles.metaValue, styles.cap]}>
              {receiptData.category}
            </Text>
          </View>
        </Surface>
      )}
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  container: { flex: 1, padding: 20, backgroundColor: '#E2E2E6' },
  title: { textAlign: 'center', marginBottom: 16 },
  previewCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: 240, borderRadius: 12, objectFit: 'cover' },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyTxt: { color: '#94a3b8', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: { flex: 1 },
  scanBtn: { marginBottom: 16 },

  label: { fontWeight: '600', color: '#0f172a' },
  resultCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mainText: { flexShrink: 1, color: '#0f172a' },
  total: { fontWeight: '600', color: '#0f172a' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metaLabel: { color: '#64748b' },
  metaValue: { color: '#334155', fontWeight: '500' },
  cap: { textTransform: 'capitalize' },
});
