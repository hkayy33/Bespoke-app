export interface SavedDua {
  duaId: string;
  dua: string;
  createdAt: string;
}

export interface CreateSavedDua {
  userId: number;
  dua: string;
}