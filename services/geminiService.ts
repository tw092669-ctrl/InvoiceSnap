import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData, InvoiceType } from "../types";

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT = `
Identify and extract data from this Taiwanese Uniform Invoice (統一發票).
It could be handwritten or printed. It is either a 2-part (二聯式) or 3-part (三聯式) invoice.

Please extract:
1. Invoice Number (發票號碼) - usually 2 letters followed by 8 digits.
2. Date (日期) - Convert ROC year (e.g. 113) to AD year (e.g. 2024). Format YYYY-MM-DD.
3. Buyer Name (買受人/抬頭) - The company name or person name.
4. Buyer Tax ID (統一編號) - 8 digit number. If empty, return empty string.
5. Items (品名/摘要) - List of items with quantity, unit price, and amount.
6. Amounts: Subtotal (銷售額), Tax (營業稅), Total (總計).
7. Invoice Type: Determine if it is '二聯式' (Duplicate) or '三聯式' (Triplicate). Usually 3-part has a Tax ID field filled.

Return strict JSON.
`;

export const extractInvoiceData = async (base64Image: string): Promise<Partial<InvoiceData>> => {
  try {
    // Remove data URL prefix if present for the API call (Handle various image types)
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Gemini detects format automatically from bytes usually, but we pass generic jpeg/png
              data: base64Data
            }
          },
          {
            text: PROMPT
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNumber: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            buyerName: { type: Type.STRING },
            buyerTaxId: { type: Type.STRING },
            type: { type: Type.STRING, enum: [InvoiceType.DUPLICATE, InvoiceType.TRIPLICATE, InvoiceType.UNKNOWN] },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  amount: { type: Type.NUMBER },
                }
              }
            },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            total: { type: Type.NUMBER },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");

    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};