import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/talep - Yeni talep oluştur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { talepEden, birim, konu, aciklama, oncelik } = body;
    
    console.log('POST request body:', body);
    
    if (!talepEden || !birim || !konu || !aciklama || !oncelik) {
      console.log('Missing required fields:', { talepEden, birim, konu, aciklama, oncelik });
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }
    
    const talep = await prisma.talep.create({
      data: {
        talepEden,
        birim,
        konu,
        aciklama,
        oncelik,
        durum: 'Bekliyor'
      },
    });
    
    console.log('Talep created:', talep);
    return NextResponse.json(talep, { status: 201 });
  } catch (error) {
    console.error('Talep oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Talep oluşturulurken bir hata oluştu', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}

// GET /api/talep - Tüm talepleri getir
export async function GET() {
  try {
    console.log('GET /api/talep called');
    
    const talepler = await prisma.talep.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Talepler fetched:', talepler.length);
    return NextResponse.json(talepler);
  } catch (error) {
    console.error('Talepleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Talepler getirilirken bir hata oluştu', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 