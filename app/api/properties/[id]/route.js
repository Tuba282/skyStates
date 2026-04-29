import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import User from '@/models/User'; // Registered for populate
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const property = await Property.findById(id).populate('agent', 'name avatar agency email');
    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    // Format _id to id for frontend
    const formatted = { ...property._doc, id: property._id };
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let body = await req.json();

    const property = await Property.findById(id);
    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    // Only owner or admin can edit
    if (property.agent.toString() !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Role-based restrictions: Admin can ONLY change status (Approve/Reject)
    if (decoded.role === 'ADMIN' && property.agent.toString() !== decoded.userId) {
       body = { status: body.status };
    }

    const updated = await Property.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const property = await Property.findById(id);

    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    if (property.agent.toString() !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Property.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
