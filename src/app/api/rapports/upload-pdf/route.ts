import { NextRequest, NextResponse } from 'next/server';
import { localStorageService } from '@/services/localStorageService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfBlob = formData.get('pdf') as Blob;
    const rapportId = formData.get('rapportId') as string;
    const nomChantier = formData.get('nomChantier') as string;
    const typeRapport = formData.get('typeRapport') as string;
    const dateRapport = formData.get('dateRapport') as string;

    if (!pdfBlob || !rapportId || !nomChantier || !typeRapport) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const date = dateRapport ? new Date(dateRapport) : new Date();
    
    // Upload du PDF localement
    const pdfUrl = await localStorageService.uploadRapportPDF(
      rapportId,
      pdfBlob,
      nomChantier,
      typeRapport,
      date
    );

    return NextResponse.json({ 
      success: true, 
      pdfUrl,
      message: 'PDF uploadé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du PDF' },
      { status: 500 }
    );
  }
}

