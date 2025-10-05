# Receipt Scanner App

A React Native Expo app that scans receipts, extracts key details using Google Gemini API, and stores results locally.

## Features

- Scan receipts using device camera/gallery
- Extract vendor, total, tax, date, and category using AI
- View and manage all scanned receipts
- Monthly expense summary with charts (bonus feature)

## Setup Instructions

1. **Clone the repository**

```bash
   git clone https://github.com/Roohan-gm/receipt-scanner-app.git

   cd receipt-scanner-app

   npm install
```

Go to Google AI Studio
Create a new project and get your API key

API used: gemini-2.5-flash-lite

Create a .env file in the project root:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

```bash
   npx expo start
```

Limitations and Assumptions of the Receipt Scanner App

1. AI/ML Model Limitations

Image Quality Dependency: Gemini API requires clear, well-lit, non-blurry receipt images. Poor quality images may result in inaccurate or failed extraction
Receipt Format Variability: Works best with standard retail receipts; may struggle with:
Handwritten receipts
Unusual layouts or non-standard formats
Receipts in languages other than English
Extremely dense or cluttered receipts
Field Extraction Accuracy: The AI may misinterpret or miss fields like vendor name, total amount, or date depending on receipt formatting

1. API Constraints

Internet Dependency: Requires active internet connection for AI processing (offline scanning not possible)
Rate Limits: Google Gemini free tier has quotas (60 requests/minute, 1500 requests/day)
API Costs: Heavy usage may incur costs beyond free tier limits
API Reliability: Dependent on Google's API uptime and availability

1. Platform & Device Limitations

Camera Quality: Lower-end device cameras may produce poor quality images affecting accuracy
Storage Limitations: AsyncStorage has size limits (~6MB on Android, larger on iOS) - not suitable for large-scale receipt storage
Performance: Processing large images or multiple receipts simultaneously may cause performance issues on older devices

1. Data Handling Assumptions

Date Format: Assumes receipts use standard date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
Currency: Extracts numeric values only; assumes decimal format but works with any currency symbol context
Category Classification: Limited to 6 predefined categories; may misclassify unusual or niche purchases
Missing Fields: Uses fallback values ("N/A" for strings, "0" for numbers) when fields aren't found

1. Security & Privacy Concerns

API Key Exposure: API key is embedded in client code (security risk for production apps)
Unencrypted Storage: AsyncStorage stores data in plain text - not suitable for sensitive financial information
Image Privacy: Receipt images containing personal information are sent to Google's servers
No Authentication: Anyone with device access can view all stored receipts

1. User Experience Constraints

Manual Image Selection: Users must manually select/capture images; no automatic receipt detection
No Image Preprocessing: No automatic image enhancement, rotation correction, or perspective correction
Limited Error Recovery: Failed extractions require complete re-scanning; no manual correction interface
No Duplicate Detection: Doesn't detect or prevent duplicate receipt entries

1. Data Management Limitations

Local Storage Only: No cloud backup or synchronization across devices
No Export Functionality: Can't export receipt data to CSV, PDF, or other formats
Limited Filtering: Monthly view only; no weekly, quarterly, or custom date range filtering
No Receipt Details: Only stores extracted fields; original receipt images aren't saved

1. Chart & Analytics Limitations

Basic Visualizations: Limited to pie and bar charts; no advanced analytics or trends
Current Month Focus: Historical data requires manual month navigation
No Budget Tracking: Doesn't support budget limits or spending alerts
Static Categories: Categories are hardcoded; users can't create custom categories
