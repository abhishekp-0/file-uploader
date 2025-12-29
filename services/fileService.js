import path from 'path';

export function getLocalFilePath(entity) {
  return path.join(process.cwd(), 'uploads', entity.storageKey);
}
