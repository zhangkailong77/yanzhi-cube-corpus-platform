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

    if (decoded.startsWith(SALT)) {
      const idStr = decoded.substring(saltLength);
      const id = parseInt(idStr, 10);
      return id;
    }

    return null;
  } catch (err) {
    return null;
  }
}
