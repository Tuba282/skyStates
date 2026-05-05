import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import User from '@/models/User'; // Registered for populate
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const beds = searchParams.get('beds');
    const agent = searchParams.get('agent');
    const all = searchParams.get('all');

    const query = {};
    if (agent) {
      query.agent = agent;
    } else if (all === 'true') {
      const token = req.cookies.get('skyestate_token')?.value;
      let isVerifiedAdmin = false;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.role === 'ADMIN') isVerifiedAdmin = true;
        } catch (e) {
          // ignore
        }
      }
      if (!isVerifiedAdmin) {
        query.status = 'Approved';
      }
    } else {
      query.status = 'Approved';
    }

    if (type && type !== 'All') query.type = type;
    if (category && category !== 'All') query.category = category;
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (beds && beds !== 'All') {
      if (beds === '4+') query.beds = { $gte: 4 };
      else query.beds = Number(beds);
    }
    
    if (search) {
      query.$or = [
        { location: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query)
      .populate('agent', 'name avatar agency')
      .sort({ createdAt: -1 });

    const formatted = properties.map(p => {
      const obj = p.toObject ? p.toObject() : p;
      return { ...obj, id: obj._id };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('PROPERTIES_GET_ERROR:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'USER') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const property = await Property.create({
      ...body,
      agent: decoded.userId
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
