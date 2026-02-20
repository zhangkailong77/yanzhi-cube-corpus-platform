const SALT = 'corpus_preview_2024';

export function encodeId(id: number): string {
  const str = id.toString();
  const combined = SALT + str;
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
    const saltLength = 'corpus_preview_2024'.length;

    // console.log('Encoded ID:', encodedId);
    // console.log('Restored with padding:', restored);
    // console.log('Decoded string:', decoded);
    // console.log('Salt length:', saltLength);
    // console.log('String before extraction:', decoded);

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(saltLength);
      const id = parseInt(idStr, 10);
      // console.log('Extracted ID:', id);
      return id;
    }

    // console.error('Decoded string does not start with salt');
    return null;
  } catch (err) {
    // console.error('Failed to decode ID:', err);
    // console.error('Error details:', err);
    return null;
  }
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
    const saltLength = 'corpus_preview_2024'.length;

    console.log('Encoded ID:', encodedId);
    console.log('Restored with padding:', restored);
    console.log('Decoded string:', decoded);
    console.log('Salt length:', saltLength);

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(saltLength);
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
