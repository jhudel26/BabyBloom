import Dexie, { type Table } from 'dexie';
import type { BabyProfile, DayPhoto, Project } from '../types';

export interface AppSettings {
  id: string;
  darkMode: boolean;
  autoSortOnUpload: boolean;
  defaultTheme: string;
  defaultLayout: string;
}

export class BabyBloomDatabase extends Dexie {
  photos!: Table<DayPhoto, string>;
  projects!: Table<Project, string>;
  profile!: Table<BabyProfile & { id: string }, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('BabyBloomDB');
    this.version(1).stores({
      photos: 'id, dayNumber, isPrimary, createdAt',
      projects: 'id, title, createdAt, updatedAt',
      profile: 'id',
      settings: 'id',
    });
  }
}

export const db = new BabyBloomDatabase();

// Helper functions for common database operations

export async function getPhotosForDay(dayNumber: number): Promise<DayPhoto[]> {
  return await db.photos.where('dayNumber').equals(dayNumber).toArray();
}

export async function getAllPhotos(): Promise<DayPhoto[]> {
  return await db.photos.toArray();
}

export async function getPrimaryPhotos(): Promise<Map<number, DayPhoto>> {
  const allPhotos = await db.photos.toArray();
  const map = new Map<number, DayPhoto>();
  
  for (const photo of allPhotos) {
    const existing = map.get(photo.dayNumber);
    if (!existing || photo.isPrimary) {
      map.set(photo.dayNumber, photo);
    }
  }
  
  return map;
}

export async function savePhoto(photo: DayPhoto): Promise<void> {
  // If this photo is set to primary, demote any other photo for this day
  if (photo.isPrimary) {
    const others = await db.photos.where('dayNumber').equals(photo.dayNumber).toArray();
    for (const other of others) {
      if (other.id !== photo.id && other.isPrimary) {
        await db.photos.update(other.id, { isPrimary: false });
      }
    }
  }
  await db.photos.put(photo);
}

export async function setPrimaryPhoto(id: string, dayNumber: number): Promise<void> {
  const photos = await db.photos.where('dayNumber').equals(dayNumber).toArray();
  for (const photo of photos) {
    await db.photos.update(photo.id, { isPrimary: photo.id === id });
  }
}

export async function deletePhoto(id: string): Promise<void> {
  const photo = await db.photos.get(id);
  if (!photo) return;
  
  await db.photos.delete(id);
  
  // If the deleted photo was primary, make the first remaining photo primary
  if (photo.isPrimary) {
    const remaining = await db.photos.where('dayNumber').equals(photo.dayNumber).toArray();
    if (remaining.length > 0) {
      await db.photos.update(remaining[0].id, { isPrimary: true });
    }
  }
}

export async function updatePhotoCrop(id: string, crop: DayPhoto['crop']): Promise<void> {
  await db.photos.update(id, { crop });
}

export async function updatePhotoDetails(id: string, updates: Partial<DayPhoto>): Promise<void> {
  await db.photos.update(id, updates);
}

// Baby Profile helpers
export async function getBabyProfile(): Promise<BabyProfile> {
  const entry = await db.profile.get('current');
  if (entry) {
    return entry;
  }
  // Default empty profile
  return {
    name: '',
    birthDate: '',
    birthWeight: '',
    birthLength: '',
    birthTime: '',
    notes: '',
  };
}

export async function saveBabyProfile(profile: BabyProfile): Promise<void> {
  await db.profile.put({ ...profile, id: 'current' });
}

// Projects helpers
export async function getAllProjects(): Promise<Project[]> {
  return await db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await db.projects.get(id);
}

export async function saveProject(project: Project): Promise<void> {
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

// Settings helpers
export async function getAppSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('user');
  if (settings) return settings;
  return {
    id: 'user',
    darkMode: false,
    autoSortOnUpload: true,
    defaultTheme: 'timeless-cream',
    defaultLayout: 'grid-30',
  };
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings();
  await db.settings.put({ ...current, ...settings, id: 'user' });
}

// Storage statistics & wipe
export async function getStorageStats() {
  const photos = await db.photos.toArray();
  const projects = await db.projects.toArray();
  let totalBytes = 0;
  for (const p of photos) {
    totalBytes += p.fileSize || p.dataUrl.length;
  }
  
  // Calculate completed days (1-30)
  const completedDaysSet = new Set(photos.map(p => p.dayNumber));
  
  return {
    photoCount: photos.length,
    completedDays: completedDaysSet.size,
    totalBytes,
    totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
    projectCount: projects.length,
  };
}

export async function wipeAllData(): Promise<void> {
  await db.photos.clear();
  await db.projects.clear();
  await db.profile.clear();
  await db.settings.clear();
}
