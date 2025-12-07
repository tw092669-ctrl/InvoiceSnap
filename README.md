# InvoiceSnap 📸

Smart handwritten invoice scanner and organizer powered by Gemini AI. Supports 2-part and 3-part Taiwanese invoices.

## 📋 Features

- **AI-Powered OCR**: Uses Google Gemini 2.5 Flash to extract data from handwritten/printed invoices
- **Taiwanese Invoice Support**: Handles both 二聯式 (2-part) and 三聯式 (3-part) invoices
- **Camera Capture**: Take photos directly or upload existing images
- **Data Management**: Store, search, and filter invoices locally
- **Dashboard Analytics**: View spending statistics and trends
- **Local Storage**: All data stored in browser localStorage

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tw092669-ctrl/InvoiceSnap.git
cd InvoiceSnap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Build for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

The built files will be in the `dist/` directory.

## 📦 Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool
- **Tailwind CSS 4** - Utility-first CSS framework
- **Google Gemini AI** - OCR and data extraction
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## 📁 Project Structure

```
InvoiceSnap/
├── components/          # React components
│   ├── Button.tsx      # Reusable button component
│   ├── Dashboard.tsx   # Analytics dashboard
│   ├── DataManagement.tsx  # Invoice list and filtering
│   └── InvoiceForm.tsx # Invoice editing form
├── services/           # External services
│   └── geminiService.ts # Gemini AI integration
├── App.tsx            # Main application component
├── types.ts           # TypeScript type definitions
├── index.tsx          # Application entry point
├── vite.config.ts     # Vite configuration
├── package.json       # Dependencies and scripts
└── metadata.json      # App metadata

```

## 🎯 Usage

1. **Scan Invoice**: Click the camera button to capture or upload an invoice image
2. **Review & Edit**: AI extracts data automatically - review and adjust if needed
3. **Save**: Store the invoice in your local database
4. **Manage**: Search, filter, and view all your invoices
5. **Analyze**: Check the dashboard for spending insights

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## 📝 Invoice Data Fields

- **Invoice Number**: 2 letters + 8 digits (e.g., AB12345678)
- **Date**: YYYY-MM-DD format (converts ROC to AD year)
- **Buyer Name**: Company or person name
- **Tax ID**: 8-digit unified business number
- **Items**: List of purchased items with quantities and prices
- **Amounts**: Subtotal, tax, and total
- **Type**: 二聯式 (Duplicate) or 三聯式 (Triplicate)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ for easier invoice management
