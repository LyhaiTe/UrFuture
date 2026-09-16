import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'node:util';
import { randomBytes, scrypt as callbackScrypt, timingSafeEqual } from 'node:crypto';
import { EducationLevel } from '@prisma/client';
import { prisma } from '@/lib/db';
import { StudentUser } from '@/types';

export const runtime = 'nodejs';

const scrypt = promisify(callbackScrypt);
const educationLevels = new Set(Object.values(EducationLevel));
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function isEducationLevel(value: string | undefined): value is EducationLevel {
  return Boolean(value && educationLevels.has(value as EducationLevel));
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;

  const expectedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      email,
      name,
      password,
      institution,
      educationLevel,
    } = body as {
      action?: 'login' | 'register';
      email?: string;
      name?: string;
      password?: string;
      institution?: string;
      educationLevel?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    const validEducationLevel = isEducationLevel(educationLevel)
      ? educationLevel
      : EducationLevel.UNIVERSITY_YEAR_2;
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      if (!strongPasswordPattern.test(password)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and symbol.',
          },
          { status: 400 }
        );
      }

      if (!name?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Full name is required to register.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          passwordHash: await hashPassword(password),
          role: 'STUDENT',
          institution: institution || 'CamTech University',
          educationLevel: validEducationLevel,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          educationLevel: user.educationLevel || 'UNIVERSITY_YEAR_2',
          institution: user.institution || 'CamTech University',
        } satisfies StudentUser,
      });
    }

    if (action !== 'login') {
      return NextResponse.json(
        { success: false, error: 'Choose registration or sign in.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: 'No matching account found. Please register first or check your credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel || 'UNIVERSITY_YEAR_2',
        institution: user.institution || 'CamTech University',
      } satisfies StudentUser,
    });
  } catch (error: unknown) {
    console.error('Auth route error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
