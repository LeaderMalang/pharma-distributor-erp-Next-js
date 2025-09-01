import type { NextApiRequest, NextApiResponse } from 'next';
import { generateSalesAnalysis } from '../../services/geminiService';

type ResponseData = {
  analysis?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const salesData = req.body;
    const analysis = await generateSalesAnalysis(salesData);
    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('Error in sales-analysis API route:', error);
    res.status(500).json({ error: error.message || 'Failed to generate sales analysis.' });
  }
}
