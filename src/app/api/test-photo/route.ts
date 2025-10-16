import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoPath = searchParams.get('path');
    
    if (!photoPath) {
      return NextResponse.json({ error: 'Chemin de photo manquant' }, { status: 400 });
    }

    // Lire le fichier photo
    const fullPath = join(process.cwd(), 'public', photoPath);
    const fileBuffer = await readFile(fullPath);
    
    // Retourner l'image
    return new NextResponse(fileBuffer as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la lecture de la photo:', error);
    return NextResponse.json({ error: 'Photo non trouvée' }, { status: 404 });
  }
}

