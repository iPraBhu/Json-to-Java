import JSZip from 'jszip';
import { sanitizeJavaIdentifier } from '../core/nameResolver';

const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const createZipBlob = async (files: Record<string, string>, rootName: string): Promise<Blob> => {
  const zip = new JSZip();
  const baseName = sanitizeJavaIdentifier(rootName, { pascal: true });
  Object.entries(files).forEach(([fileName, content]) => {
    const safeName = sanitizeFileName(fileName);
    zip.file(safeName || `${baseName}.java`, content);
  });
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
};

export const triggerDownload = (blob: Blob, rootName: string): void => {
  const fileName = `${sanitizeFileName(rootName)}_pojos.zip`.replace(/_+/, '_').toLowerCase();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || 'json-to-pojo.zip';
  anchor.rel = 'noopener noreferrer';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
