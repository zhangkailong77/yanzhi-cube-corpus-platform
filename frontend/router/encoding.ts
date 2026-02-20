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

    const base64WithPadding = restored.padEnd(Math.ceil(restored.length / 4) * 4, '=');
    const decoded = atob(base64WithPadding);

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(SALT.length);
      return parseInt(idStr, 10);
    }

    return null;
  } catch (err) {
    console.error('Failed to decode ID:', err);
    return null;
  }
}
