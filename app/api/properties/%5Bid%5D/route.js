import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const property = await Property.findById(params.id).populate('agent', 'name avatar agency email');
    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    const formatted = { ...property._doc, id: property._id };
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    const property = await Property.findById(params.id);
    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    if (property.agent.toString() !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updated = await Property.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const property = await Property.findById(params.id);

    if (!property) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

    if (property.agent.toString() !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Property.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
