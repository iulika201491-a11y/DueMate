import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 });
    }

    // Just return empty form - user fills it manually
    return NextResponse.json({
      invoiceNumber: '',
      amount: 0,
      dueDate: '',
      clientName: '',
      clientEmail: '',
      fileName: file.name,
      success: true,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 400 }
    );
  }
}
