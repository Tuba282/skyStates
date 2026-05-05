import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Property from '@/models/Property'; // Registered for populate
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendInquiryToAgent } from '@/lib/mailer';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const inquiry = await Inquiry.create(body);

    // Fetch property and agent to send email
    try {
      const property = await Property.findById(body.property).populate('agent', 'email name');
      if (property && property.agent && property.agent.email) {
        await sendInquiryToAgent(property.agent.email, {
          propertyTitle: property.title,
          senderName: body.senderName,
          senderEmail: body.senderEmail,
          message: body.message,
        });
      }
    } catch (emailError) {
      console.error('Error triggering inquiry email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('INQUIRY_POST_ERROR:', error);
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Convert string userId to ObjectId for proper MongoDB comparison
    const agentObjectId = new mongoose.Types.ObjectId(decoded.userId);
    const query = decoded.role === 'ADMIN' ? {} : { agent: agentObjectId };

    const inquiries = await Inquiry.find(query)
      .populate('property', 'title images location')
      .sort({ createdAt: -1 });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('INQUIRIES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}
