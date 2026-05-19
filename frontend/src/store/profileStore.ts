import { create } from 'zustand';
import { UserProfile, ProfileStore } from '../types/profile';

function generateId(): string {
  return crypto.randomUUID();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Профиль по умолчанию (заглушка)
const defaultProfile: UserProfile = {
  id: generateId(),
  userId: generateId(),
  displayName: 'Алексей Козлов',
  bio: null,
  avatarUrl: null,
  website: null,
  github: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useProfileStore = create<ProfileStore>()(
  (set, get) => ({
    profile: defaultProfile,

    setProfile: (profile) => {
      set({ profile });
    },

    updateProfile: (updates) => {
      const { profile } = get();
      if (!profile) return;

      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      set({ profile: updatedProfile });
    },

    clearProfile: () => {
      set({ profile: null });
    },

    getInitials: () => {
      const { profile } = get();
      if (!profile) return '??';
      return getInitials(profile.displayName);
    },
  })
);
