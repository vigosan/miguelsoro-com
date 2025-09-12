import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, file } = req.body;

    if (!filename || !file) {
      return res.status(400).json({ error: 'Filename and file are required' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    
    // Upload to Vercel Blob
    const blob = await put(`pictures/${filename}`, buffer, {
      access: 'public',
      contentType: file.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/webp',
    });

    return res.status(200).json({ 
      url: blob.url,
      downloadUrl: blob.downloadUrl 
    });
  } catch (error) {
    console.error('Error uploading to Blob:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}