export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

export function isValidFileSize(fileSize: number, maxSizeBytes: number): boolean {
  return fileSize <= maxSizeBytes;
}

