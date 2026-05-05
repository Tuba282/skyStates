import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendReplyToUser } from '@/lib/mailer';
import Property from '@/models/Property'; // Ensure Property is registered
import User from '@/models/User'; // Ensure User is registered

// PATCH /api/inquiries/[id] — Agent reply kare
export async function PATCH(req, context) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { replyText } = await req.json();

    if (!replyText?.trim()) {
      return NextResponse.json({ message: 'Reply text is required' }, { status: 400 });
    }

    // Next.js 16: params is a Promise, must be awaited
    const { id } = await context.params;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });

    // Only the inquiry's agent or admin can reply
    if (decoded.role !== 'ADMIN' && inquiry.agent.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      {
        $set: {
          reply: { text: replyText.trim(), repliedAt: new Date() },
          status: 'Replied'
        }
      },
      { new: true, strict: false }
    ).populate('property', 'title').populate('agent', 'name');

    // Send email to user
    try {
      if (updatedInquiry && updatedInquiry.senderEmail && updatedInquiry.property && updatedInquiry.agent) {
        await sendReplyToUser(updatedInquiry.senderEmail, {
          propertyTitle: updatedInquiry.property.title,
          agentName: updatedInquiry.agent.name,
          replyText: replyText.trim(),
          originalMessage: updatedInquiry.message,
        });
      }
    } catch (emailError) {
      console.error('Error triggering reply email:', emailError);
    }

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error('INQUIRY_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
