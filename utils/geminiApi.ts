import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, Part } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

export async function extractReceiptData(imageBase64: string) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    const prompt = `Analyze this receipt image and extract the following information in JSON format only:
- vendor_name: The store/restaurant name
- total_amount: The total amount paid (numbers only, no currency symbols)
- tax: The tax amount (numbers only)
- date: The transaction date in YYYY-MM-DD format
- category: Categorize as "Food & Drinks", "Groceries", "Transportation", "Entertainment", "Shopping", or "Other"

Return ONLY valid JSON with these exact keys. If a field is not found, use "N/A" for strings or "0" for numbers.`;

    const imageParts: Part[] = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
    ];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const text = response.text();

    // Clean the response to extract only JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini API error: ', error);
    throw new Error('Failed to extract receipt data. Please try again.');
  }
}
