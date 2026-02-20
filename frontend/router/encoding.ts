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
    const restored = encodedId
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddingLength = (4 - (restored.length % 4)) % 4;
    const base64WithPadding = restored + '='.repeat(paddingLength);
    const decoded = atob(base64WithPadding);

    console.log('Decoded string:', decoded);

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(SALT.length);
      const id = parseInt(idStr, 10);
      console.log('Extracted ID:', id);
      return id;
    }

    console.error('Decoded string does not start with salt');
    return null;
  } catch (err) {
    console.error('Failed to decode ID:', err);
    return null;
  }
}
