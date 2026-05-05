import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User'; // Register for populate
import { NextResponse } from 'next/server';

// GET /api/properties/[id]/inquiries — Public: all inquiries + replies for a property
export async function GET(req, context) {
  try {
    await dbConnect();
    const { id } = await context.params; // Next.js 16: params is a Promise

    const inquiries = await Inquiry.find({ property: id })
      .select('senderName message status reply createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('PROPERTY_INQUIRIES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
