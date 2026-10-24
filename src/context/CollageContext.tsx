import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { BabyProfile, CollageConfig, DayPhoto, Project } from '../types';
import {
  db,
  getAllPhotos,
  getBabyProfile,
  saveBabyProfile,
  getAllProjects,
  saveProject as dbSaveProject,
  deleteProject as dbDeleteProject,
  deletePhoto as dbDeletePhoto,
  savePhoto as dbSavePhoto,
  setPrimaryPhoto as dbSetPrimaryPhoto,
  updatePhotoCrop as dbUpdatePhotoCrop,
  getAppSettings,
  saveAppSettings,
  wipeAllData,
} from '../db';
import { fileToDataUrl, extractDateFromFile, generateSamplePhotoDataUrl } from '../utils/imageUtils';

export interface BulkUploadItem {
  file: File;
  suggestedDay: number;
  dateTaken: string;
}

interface CollageContextType {
  photos: Map<number, DayPhoto>;
  allPhotos: DayPhoto[];
  profile: BabyProfile;
  config: CollageConfig;
  projects: Project[];
  activeProjectId: string | null;
  darkMode: boolean;
  isLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  // Actions
  uploadSinglePhoto: (dayNumber: number, file: File) => Promise<DayPhoto>;
  uploadBulkPhotos: (items: BulkUploadItem[]) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  setPrimary: (id: string, dayNumber: number) => Promise<void>;
  updateCrop: (dayNumber: number, crop: DayPhoto['crop']) => Promise<void>;
  updateProfile: (profile: Partial<BabyProfile>) => Promise<void>;
  updateConfig: (updates: Partial<CollageConfig>) => void;
  undo: () => void;
  redo: () => void;
  saveCurrentProject: (title?: string) => Promise<Project>;
  loadProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createNewProject: (title?: string) => void;
  loadSamplePhotos: () => Promise<void>;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  wipeAll: () => Promise<void>;
}

const DEFAULT_CONFIG: CollageConfig = {
  id: 'current-config',
  name: "My Baby's First 30 Days",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  layout: 'grid-30',
  themeId: 'timeless-cream',
  dimensionId: 'portrait-4-5',
  heroDay: 1,
  spacing: 12,
  outerPadding: 48,
  borderRadius: 8,
  borderWidth: 3,
  borderColor: '',
  shadowEnabled: true,
  showDayNumbers: true,
  dayNumberFormat: 'Day X',
  showDates: false,
  showBabyInfo: true,
  title: "Our Baby's First 30 Days",
  subtitle: 'Thirty days of little moments, endless love.',
  milestoneText: 'BabyBloom Keepsake • Thirty Days of Love & Wonder',
  showDecorations: true,
};

const CollageContext = createContext<CollageContextType | undefined>(undefined);

export const CollageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Map<number, DayPhoto>>(new Map());
  const [allPhotos, setAllPhotos] = useState<DayPhoto[]>([]);
  const [profile, setProfile] = useState<BabyProfile>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthWeight: '',
    birthLength: '',
    notes: '',
  });
  const [config, setConfigState] = useState<CollageConfig>(DEFAULT_CONFIG);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Undo/Redo stack for configuration
  const undoStack = useRef<CollageConfig[]>([]);
  const redoStack = useRef<CollageConfig[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const storedPhotos = await getAllPhotos();
      setAllPhotos(storedPhotos);

      const map = new Map<number, DayPhoto>();
      for (const p of storedPhotos) {
        const existing = map.get(p.dayNumber);
        if (!existing || p.isPrimary) {
          map.set(p.dayNumber, p);
        }
      }
      setPhotos(map);

      const storedProfile = await getBabyProfile();
      setProfile(storedProfile);

      const storedProjects = await getAllProjects();
      setProjects(storedProjects);

      const settings = await getAppSettings();
      setDarkMode(settings.darkMode);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update config with undo tracking
  const updateConfig = useCallback((updates: Partial<CollageConfig>) => {
    setConfigState((prev) => {
      undoStack.current.push({ ...prev });
      redoStack.current = []; // Clear redo stack on new action
      return {
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const previous = undoStack.current.pop()!;
    setConfigState((current) => {
      redoStack.current.push({ ...current });
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    setConfigState((current) => {
      undoStack.current.push({ ...current });
      return next;
    });
  }, []);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Single Photo Upload
  const uploadSinglePhoto = async (dayNumber: number, file: File): Promise<DayPhoto> => {
    const dataUrl = await fileToDataUrl(file);
    const dateTaken = extractDateFromFile(file);

    // Check if day already has photos
    const existing = await db.photos.where('dayNumber').equals(dayNumber).toArray();
    const isFirst = existing.length === 0;

    const newPhoto: DayPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dayNumber,
      dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      dateTaken,
      isPrimary: isFirst, // First photo uploaded for a day is primary by default
      crop: { x: 0.5, y: 0.28, scale: 1, rotation: 0 },
      createdAt: Date.now(),
    };

    await dbSavePhoto(newPhoto);
    await refreshData();
    return newPhoto;
  };

  // Bulk Upload
  const uploadBulkPhotos = async (items: BulkUploadItem[]): Promise<void> => {
    for (const item of items) {
      const dataUrl = await fileToDataUrl(item.file);
      const existing = await db.photos.where('dayNumber').equals(item.suggestedDay).toArray();
      const isFirst = existing.length === 0;

      const newPhoto: DayPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        dayNumber: item.suggestedDay,
        dataUrl,
        fileName: item.file.name,
        fileSize: item.file.size,
        mimeType: item.file.type,
        dateTaken: item.dateTaken,
        isPrimary: isFirst,
        crop: { x: 0.5, y: 0.28, scale: 1, rotation: 0 },
        createdAt: Date.now(),
      };
      await dbSavePhoto(newPhoto);
    }
    await refreshData();
  };

  // Set Primary Photo for a Day
  const setPrimary = async (id: string, dayNumber: number) => {
    await dbSetPrimaryPhoto(id, dayNumber);
    await refreshData();
  };

  // Delete Photo
  const deletePhoto = async (id: string) => {
    await dbDeletePhoto(id);
    await refreshData();
  };

  // Update Crop with fast optimistic update for real-time dragging in collage
  const updateCrop = async (dayNumber: number, crop: DayPhoto['crop']) => {
    const primary = photos.get(dayNumber);
    if (primary) {
      // Optimistically update state immediately for smooth canvas dragging
      setPhotos((prev) => {
        const next = new Map(prev);
        next.set(dayNumber, { ...primary, crop });
        return next;
      });
      await dbUpdatePhotoCrop(primary.id, crop);
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<BabyProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await saveBabyProfile(updated);
  };

  // Toggle Dark Mode
  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await saveAppSettings({ darkMode: next });
  };

  // Project Management
  const saveCurrentProject = async (title?: string): Promise<Project> => {
    const projectId = activeProjectId || `proj_${Date.now()}`;
    const projectTitle = title || config.name || `Collage - ${new Date().toLocaleDateString()}`;

    const project: Project = {
      id: projectId,
      title: projectTitle,
      createdAt: activeProjectId ? (projects.find(p => p.id === activeProjectId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      config: {
        ...config,
        id: projectId,
        name: projectTitle,
      },
    };

    await dbSaveProject(project);
    setActiveProjectId(projectId);
    await refreshData();
    return project;
  };

  const loadProject = async (id: string) => {
    const found = await db.projects.get(id);
    if (found) {
      setConfigState(found.config);
      setActiveProjectId(found.id);
      undoStack.current = [];
      redoStack.current = [];
    }
  };

  const duplicateProject = async (id: string) => {
    const found = await db.projects.get(id);
    if (found) {
      const newId = `proj_${Date.now()}`;
      const duplicate: Project = {
        ...found,
        id: newId,
        title: `${found.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        config: {
          ...found.config,
          id: newId,
          name: `${found.config.name} (Copy)`,
        },
      };
      await dbSaveProject(duplicate);
      await refreshData();
    }
  };

  const deleteProject = async (id: string) => {
    await dbDeleteProject(id);
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
    await refreshData();
  };

  const createNewProject = (title?: string) => {
    setActiveProjectId(null);
    setConfigState({
      ...DEFAULT_CONFIG,
      id: `config_${Date.now()}`,
      name: title || "My Baby's First 30 Days",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    undoStack.current = [];
    redoStack.current = [];
  };

  // Load sample photos for instant demonstration
  const loadSamplePhotos = async () => {
    setIsLoading(true);
    for (let day = 1; day <= 30; day++) {
      const existing = await db.photos.where('dayNumber').equals(day).toArray();
      if (existing.length === 0) {
        const dataUrl = generateSamplePhotoDataUrl(day);
        const samplePhoto: DayPhoto = {
          id: `sample_photo_${day}_${Date.now()}`,
          dayNumber: day,
          dataUrl,
          fileName: `day_${day}_keepsake.jpg`,
          fileSize: 45000,
          mimeType: 'image/jpeg',
          dateTaken: new Date(Date.now() - (30 - day) * 86400000).toISOString().split('T')[0],
          isPrimary: true,
          crop: { x: 0.5, y: 0.28, scale: 1, rotation: 0 },
          createdAt: Date.now(),
        };
        await dbSavePhoto(samplePhoto);
      }
    }
    await refreshData();
  };

  // Wipe All Data
  const wipeAll = async () => {
    await wipeAllData();
    setPhotos(new Map());
    setAllPhotos([]);
    setProfile({
      name: '',
      birthDate: '',
      birthTime: '',
      birthWeight: '',
      birthLength: '',
      notes: '',
    });
    setConfigState(DEFAULT_CONFIG);
    setProjects([]);
    setActiveProjectId(null);
    undoStack.current = [];
    redoStack.current = [];
  };

  return (
    <CollageContext.Provider
      value={{
        photos,
        allPhotos,
        profile,
        config,
        projects,
        activeProjectId,
        darkMode,
        isLoading,
        canUndo,
        canRedo,
        uploadSinglePhoto,
        uploadBulkPhotos,
        deletePhoto,
        setPrimary,
        updateCrop,
        updateProfile,
        updateConfig,
        undo,
        redo,
        saveCurrentProject,
        loadProject,
        duplicateProject,
        deleteProject,
        createNewProject,
        loadSamplePhotos,
        toggleDarkMode,
        refreshData,
        wipeAll,
      }}
    >
      {children}
    </CollageContext.Provider>
  );
};

export const useCollage = () => {
  const context = useContext(CollageContext);
  if (!context) {
    throw new Error('useCollage must be used within a CollageProvider');
  }
  return context;
};
