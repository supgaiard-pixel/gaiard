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
    
    // Convertir en base64
    const base64 = fileBuffer.toString('base64');
    
    // Déterminer le type MIME
    const extension = photoPath.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (extension === 'png') mimeType = 'image/png';
    if (extension === 'gif') mimeType = 'image/gif';
    
    return NextResponse.json({ 
      base64,
      mimeType,
      size: fileBuffer.length
    });
  } catch (error) {
    console.error('Erreur lors de la lecture de la photo:', error);
    return NextResponse.json({ error: 'Photo non trouvée' }, { status: 404 });
  }
}

