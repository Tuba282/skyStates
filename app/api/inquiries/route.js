import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Property from '@/models/Property'; // Registered for populate
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const inquiry = await Inquiry.create(body);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const query = decoded.role === 'ADMIN' ? {} : { agent: decoded.userId };
    const inquiries = await Inquiry.find(query).populate('property', 'title images').sort({ createdAt: -1 });

    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
