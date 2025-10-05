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
Create a .env file in the project root:

EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here

```bash
   npx expo start
```
