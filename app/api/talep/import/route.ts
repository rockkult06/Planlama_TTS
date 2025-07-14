import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const importedTalepler = [];
    let successCount = 0;
    let errorCount = 0;

    for (const row of jsonData) {
      try {
        // Excel'den gelen veriyi veritabanı formatına dönüştür
        const rowData = row as any;
        const talepData = {
          talepEden: rowData['Talep Eden'] || rowData['Talep Sahibi'] || '',
          birim: rowData['Birim'] || rowData['Talep Sahibi Açıklaması'] || 'Diğer',
          isletici: rowData['İşletici'] || rowData['İşletici'] || 'Eshot',
          konu: rowData['Konu'] || rowData['Talep Özeti'] || '',
          aciklama: rowData['Açıklama'] || rowData['Yapılan İş'] || '',
          oncelik: rowData['Öncelik'] || 'Normal',
          durum: rowData['Durum'] || 'Bekliyor'
        };

        // Veritabanına kaydet
        const talep = await prisma.talep.create({
          data: talepData
        });

        importedTalepler.push(talep);
        successCount++;
      } catch (error) {
        console.error('Talep kaydetme hatası:', error);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: `${successCount} talep başarıyla import edildi`,
      importedCount: successCount,
      errorCount: errorCount,
      talepler: importedTalepler
    });

  } catch (error) {
    console.error('Excel import hatası:', error);
    return NextResponse.json(
      { error: 'Excel dosyası işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 