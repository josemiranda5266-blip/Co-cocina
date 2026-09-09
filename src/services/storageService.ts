import { CustomCollection } from '../types';

const FAVORITES_KEY = 'concocina_favorites';
const HISTORY_KEY = 'concocina_history';
const COLLECTIONS_KEY = 'concocina_collections';

export function getFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(recipeId: string): string[] {
  const favs = getFavorites();
  const exists = favs.includes(recipeId);
  const updated = exists ? favs.filter(id => id !== recipeId) : [...favs, recipeId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore quota error
  }
  return updated;
}

export function isFavorite(recipeId: string): boolean {
  return getFavorites().includes(recipeId);
}

export function getRecentlyViewed(): string[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(recipeId: string): string[] {
  const current = getRecentlyViewed().filter(id => id !== recipeId);
  const updated = [recipeId, ...current].slice(0, 20); // Keep last 20
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function getCustomCollections(): CustomCollection[] {
  try {
    const data = localStorage.getItem(COLLECTIONS_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // Fallback empty
  }

  return [];
}

export function saveCustomCollections(collections: CustomCollection[]) {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch {
    // Ignore
  }
}

export function addCollection(name: string, description?: string): CustomCollection[] {
  const current = getCustomCollections();
  const newCol: CustomCollection = {
    id: 'col-' + Date.now(),
    name,
    description,
    recipeIds: [],
    createdAt: new Date().toISOString()
  };
  const updated = [...current, newCol];
  saveCustomCollections(updated);
  return updated;
}

export function toggleRecipeInCollection(collectionId: string, recipeId: string): CustomCollection[] {
  const current = getCustomCollections();
  const updated = current.map(col => {
    if (col.id === collectionId) {
      const exists = col.recipeIds.includes(recipeId);
      return {
        ...col,
        recipeIds: exists ? col.recipeIds.filter(id => id !== recipeId) : [...col.recipeIds, recipeId]
      };
    }
    return col;
  });
  saveCustomCollections(updated);
  return updated;
}
