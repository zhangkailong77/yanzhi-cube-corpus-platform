const SALT = 'corpus_preview_2024';

export function encodeId(id: number): string {
  const str = id.toString();
  const combined = str + SALT;
  const encoded = btoa(combined);

  return encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeId(encodedId: string): number | null {
  try {
    let restored = encodedId
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (restored.length % 4 !== 0) {
      restored += '=';
    }

    const decoded = atob(restored);

    console.log('Encoded ID:', encodedId);
    console.log('Restored with padding:', restored);
    console.log('Decoded string:', decoded);
    console.log('SALT length:', SALT.length);
    console.log('String before extraction:', decoded);

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(0, decoded.length - SALT.length);
      const id = parseInt(idStr, 10);
      console.log('Extracted ID:', id);
      return id;
    }

    console.error('Decoded string does not start with salt');
    return null;
  } catch (err) {
    console.error('Failed to decode ID:', err);
    console.error('Error details:', err);
    return null;
  }
}
