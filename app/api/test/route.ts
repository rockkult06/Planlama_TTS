import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    const talepCount = await prisma.talep.count();
    
    return NextResponse.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı',
      talepCount: talepCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Veritabanı test hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Veritabanı bağlantısı başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 