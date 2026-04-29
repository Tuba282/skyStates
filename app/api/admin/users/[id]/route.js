import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { status, password, role, name } = await req.json();
    console.log('UPDATING_USER:', id, { status, role, name });

    // Prevent admin from blocking themselves via this route just in case
    if (id === decoded.userId && status === 'BLOCKED') {
        return NextResponse.json({ message: 'Cannot block yourself' }, { status: 400 });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    console.log('UPDATE_DATA_PREPARED:', updateData);

    // Using direct collection update to bypass any mongoose schema caching issues
    const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const user = result.value || result;
    console.log('USER_AFTER_UPDATE:', user);
    
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('UPDATE_USER_ERROR:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    if (id === decoded.userId) {
        return NextResponse.json({ message: 'Cannot delete yourself' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'User terminated successfully' });
  } catch (error) {
    console.error('DELETE_USER_ERROR:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
