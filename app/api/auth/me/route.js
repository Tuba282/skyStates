import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use the User model for consistency
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.status === 'BLOCKED') {
      return NextResponse.json({ message: 'User blocked' }, { status: 403 });
    }

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        bio: user.bio || '',
        agency: user.agency || ''
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    // Secure update: prevent modification of sensitive fields and avatar
    const { avatar, role, status, password, email, ...updateData } = body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone || '',
        bio: updatedUser.bio || '',
        agency: updatedUser.agency || ''
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
