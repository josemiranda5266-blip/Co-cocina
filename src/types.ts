export type DifficultyLevel = 'Fácil' | 'Media' | 'Avanzada';

export type VideoSourcePlatform = 'youtube' | 'vimeo' | 'facebook' | 'instagram' | 'tiktok' | 'website' | 'rss' | 'manual';

export type RecipeStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'REJECTED' | 'HIDDEN' | 'FLAGGED';

export interface VideoReference {
  source: VideoSourcePlatform;
  externalId: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  duration?: string; // e.g. "12:45" or "45 min"
  durationSeconds?: number;
  author: string;
  authorUrl?: string;
  publishedAt?: string;
  viewCount?: number;
}

export interface AIAnalysis {
  ingredients: string[];
  categories: string[];
  subcategory?: string;
  difficulty: DifficultyLevel;
  estimatedDuration: string;
  mealType: string; // e.g. "Almuerzo/Cena", "Desayuno", "Postre"
  cuisine: string; // e.g. "Argentina", "Italiana", "Mexicana", "Internacional"
  confidence: number; // 0 - 1
  model: string;
  analyzedAt: string;
  summary: string;
  tags: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isBudgetFriendly?: boolean;
  isQuick?: boolean;
  isHealthy?: boolean;
}

export interface IngredientItem {
  name: string;
  amount?: string;
  isConfirmed: boolean; // true = provided by author, false = inferred by AI
}

export interface QualityFactors {
  metadataCompleteness: number; // 0-25
  clearTitle: number; // 0-15
  imageAvailable: number; // 0-15
  validSource: number; // 0-15
  aiClassificationAccuracy: number; // 0-15
  noDuplicates: number; // 0-15
  totalScore: number; // 0-100
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  video: VideoReference;
  ingredients: IngredientItem[];
  categories: string[];
  subcategories?: string[];
  tags: string[];
  difficulty: DifficultyLevel;
  duration: string; // e.g. "45 min"
  prepTimeMinutes?: number;
  servings?: number;
  cuisine: string;
  language: string;
  country?: string;
  dietaryBadges?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    quick?: boolean;
    budget?: boolean;
    healthy?: boolean;
  };
  aiMetadata: AIAnalysis;
  qualityScore: number;
  qualityFactors?: QualityFactors;
  status: RecipeStatus;
  viewsInternal: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
}

export interface DuplicateCheckResult {
  isPossibleDuplicate: boolean;
  existingRecipeId?: string;
  existingTitle?: string;
  similarityScore: number; // 0 - 1
  reason?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  group: 'Comidas' | 'Repostería' | 'Otras';
  iconName: string;
  description: string;
  subcategories: string[];
}

export interface Report {
  id: string;
  recipeId: string;
  recipeTitle: string;
  reason: 'enlace_roto' | 'contenido_eliminado' | 'categoria_incorrecta' | 'informacion_incorrecta' | 'contenido_inapropiado' | 'derechos_autor' | 'duplicado';
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface CustomCollection {
  id: string;
  name: string;
  description?: string;
  recipeIds: string[];
  createdAt: string;
}

export interface SourceConfig {
  id: string;
  name: string;
  platform: VideoSourcePlatform;
  url: string;
  isActive: boolean;
  importFrequencyHours: number;
  lastImportAt?: string;
  totalImported: number;
  errorsCount: number;
}

export interface SearchFilters {
  query: string;
  category?: string;
  ingredient?: string;
  difficulty?: string;
  maxTimeMinutes?: number;
  cuisine?: string;
  platform?: VideoSourcePlatform;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isBudget?: boolean;
  isQuick?: boolean;
  isHealthy?: boolean;
  sortBy?: 'relevance' | 'score' | 'newest' | 'views';
}

export interface PantryMatchResult {
  recipe: Recipe;
  matchedIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  matchLevel: 'GREEN' | 'YELLOW' | 'RED'; // 🟢 All/most, 🟡 Missing few, 🔴 Missing many
}
