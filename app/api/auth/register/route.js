import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password, role } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
    });

    return NextResponse.json({ id: user._id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error('REGISTER_ERROR:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
