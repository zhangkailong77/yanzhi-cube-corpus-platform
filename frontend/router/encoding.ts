export function encodeId(id: number): string {
  const hex = id.toString(16).padStart(2, '0');
  return hex.toUpperCase();
}

export function decodeId(encodedId: string): number | null {
  try {
    const parsed = parseInt(encodedId, 16);
    if (isNaN(parsed)) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to decode ID:', err);
    return null;
  }
}
