import type { NextApiRequest, NextApiResponse } from 'next';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

type ResponseData = {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ invoiceNumber: '', amount: 0, dueDate: '', clientName: '', clientEmail: '', error: 'Method not allowed' });
    return;
  }

  try {
    const buffer = req.body;

    if (!buffer) {
      throw new Error('No file provided');
    }

    const data = await pdf(buffer);
    const text = data.text;

    // Extract patterns from PDF text
    const invoiceMatch = text.match(/invoice\s*(?:number|#|no\.?)[\s:]*([A-Z0-9\-#]+)/i);
    const amountMatch = text.match(/(?:total|amount\s*due)[\s:]*\$?([\d,]+\.?\d*)/i);
    const dateMatch = text.match(/(?:due\s*date|due)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    const emailMatch = text.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

    res.status(200).json({
      invoiceNumber: invoiceMatch ? invoiceMatch[1].trim() : '',
      amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
      dueDate: dateMatch ? dateMatch[1].trim() : '',
      clientName: '',
      clientEmail: emailMatch ? emailMatch[1].trim() : '',
      success: true,
    });
  } catch (error: any) {
    console.error('PDF parse error:', error);
    res.status(200).json({
      invoiceNumber: '',
      amount: 0,
      dueDate: '',
      clientName: '',
      clientEmail: '',
      success: true,
      error: 'Could not extract data. Please fill manually.',
    });
  }
}
