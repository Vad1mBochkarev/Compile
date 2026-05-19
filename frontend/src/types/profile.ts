export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  github: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  getInitials: () => string;
}
