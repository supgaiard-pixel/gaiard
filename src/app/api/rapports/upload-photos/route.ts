import { NextRequest, NextResponse } from 'next/server';
import { photoService } from '@/services/photoService';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rapportId = formData.get('rapportId') as string;
    const photos = formData.getAll('photos') as File[];

    if (!rapportId || photos.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Uploader toutes les photos
    const photoUrls = await photoService.uploadPhotos(photos, rapportId);

    return NextResponse.json({ 
      success: true, 
      photoUrls,
      message: `${photoUrls.length} photo(s) uploadée(s) avec succès` 
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload des photos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des photos' },
      { status: 500 }
    );
  }
}

