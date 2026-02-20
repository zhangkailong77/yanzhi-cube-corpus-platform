export function encodeId(id: number): string {
  const str = id.toString();
  return btoa(str);
}

export function decodeId(encodedId: string): number | null {
  try {
    const decoded = atob(encodedId);
    return parseInt(decoded, 10);
  } catch (err) {
    console.error('Failed to decode ID:', err);
    return null;
  }
}
