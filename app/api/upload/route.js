import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    // Only include upload_preset in signature if it's not the default placeholder
    const paramsToSign = { timestamp };
    if (preset && preset !== 'your_upload_preset') {
      paramsToSign.upload_preset = preset;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    return NextResponse.json({ message: 'Signature Error', error: error.message }, { status: 500 });
  }
}
