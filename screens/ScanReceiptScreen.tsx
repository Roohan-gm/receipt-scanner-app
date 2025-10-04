import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { extractReceiptData } from '../utils/geminiApi';
import { Receipt, saveReceipt } from '../utils/storage';

export default function ScanReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setReceiptData(null);
    }
  };

  const scanReceipt = async () => {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Convert image to base64
      const base64 = await convertImageToBase64(imageUri);

      // Extract data using Gemini
      const data = await extractReceiptData(base64);

      // Save to local storage
      const savedReceipt = await saveReceipt(data);
      setReceiptData(savedReceipt);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string; // data:URL is always string here
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f5f5f5' }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {!imageUri ? (
          <Button mode="contained" onPress={pickImage}>
            Select Receipt Image
          </Button>
        ) : (
          <View>
            <Button mode="contained" onPress={pickImage} style={{ marginBottom: 16 }}>
              Change Image
            </Button>
            <Button mode="contained" onPress={scanReceipt} disabled={loading} loading={loading}>
              {loading ? 'Scanning...' : 'Scan Receipt'}
            </Button>
          </View>
        )}
      </View>

      {receiptData && (
        <Card style={{ marginTop: 20 }}>
          <Card.Content>
            <Text variant="titleLarge">Receipt Details</Text>
            <Text variant="bodyMedium">
              <Text style={{ fontWeight: 'bold' }}>Vendor:</Text> {receiptData.vendor_name}
            </Text>
            <Text variant="bodyMedium">
              <Text style={{ fontWeight: 'bold' }}>Total:</Text> ${receiptData.total_amount}
            </Text>
            <Text variant="bodyMedium">
              <Text style={{ fontWeight: 'bold' }}>Tax:</Text> ${receiptData.tax}
            </Text>
            <Text variant="bodyMedium">
              <Text style={{ fontWeight: 'bold' }}>Date:</Text> {receiptData.date}
            </Text>
            <Text variant="bodyMedium">
              <Text style={{ fontWeight: 'bold' }}>Category:</Text> {receiptData.category}
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}
