import { Recipe, DuplicateCheckResult, QualityFactors, IngredientItem, AIAnalysis } from '../types';

/**
 * Calculates Quality Score (0-100) based on requirements
 */
export function calculateQualityScore(
  recipe: Partial<Recipe>,
  hasPossibleDuplicate = false,
  userReportsCount = 0
): QualityFactors {
  let metadataCompleteness = 0;
  if (recipe.title) metadataCompleteness += 5;
  if (recipe.description && recipe.description.length > 20) metadataCompleteness += 5;
  if (recipe.video?.author) metadataCompleteness += 5;
  if (recipe.duration && recipe.duration !== 'N/A') metadataCompleteness += 5;
  if (recipe.cuisine) metadataCompleteness += 5;

  let clearTitle = 0;
  if (recipe.title && recipe.title.length >= 8 && recipe.title.length <= 100) {
    clearTitle = 15;
  } else if (recipe.title) {
    clearTitle = 8;
  }

  let imageAvailable = 0;
  if (recipe.video?.thumbnailUrl && !recipe.video.thumbnailUrl.includes('placeholder')) {
    imageAvailable = 15;
  }

  let validSource = 0;
  if (recipe.video?.source === 'youtube' || recipe.video?.source === 'vimeo') {
    validSource = 15;
  } else if (recipe.video?.originalUrl) {
    validSource = 10;
  }

  let aiAccuracy = 0;
  const ingredientsCount = recipe.ingredients?.length || 0;
  if (ingredientsCount >= 5) aiAccuracy += 10;
  else if (ingredientsCount >= 2) aiAccuracy += 5;

  if (recipe.categories && recipe.categories.length > 0) aiAccuracy += 5;

  let noDuplicates = 15;
  if (hasPossibleDuplicate) {
    noDuplicates = 5;
  }

  // Deduct for reports
  let totalScore = metadataCompleteness + clearTitle + imageAvailable + validSource + aiAccuracy + noDuplicates;
  if (userReportsCount > 0) {
    totalScore = Math.max(0, totalScore - userReportsCount * 15);
  }

  return {
    metadataCompleteness,
    clearTitle,
    imageAvailable,
    validSource,
    aiClassificationAccuracy: aiAccuracy,
    noDuplicates,
    totalScore: Math.min(100, Math.max(0, totalScore))
  };
}

/**
 * Calculates String Similarity (Token Jaccard & Levenshtein hybrid)
 */
function stringSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const str1 = s1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '');
  const str2 = s2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '');

  if (str1 === str2) return 1.0;

  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });

  const union = words1.size + words2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Checks for duplicates against an existing recipe list
 */
export function checkDuplicate(
  newUrl: string,
  externalId: string,
  newTitle: string,
  existingRecipes: Recipe[]
): DuplicateCheckResult {
  const normNewUrl = newUrl.toLowerCase().trim();

  for (const existing of existingRecipes) {
    // 1. Exact externalId match
    if (externalId && existing.video.externalId === externalId && existing.video.source === existing.video.source) {
      return {
        isPossibleDuplicate: true,
        existingRecipeId: existing.id,
        existingTitle: existing.title,
        similarityScore: 1.0,
        reason: 'Identificador externo exacto (Misma fuente y ID).'
      };
    }

    // 2. Exact URL match
    if (existing.video.originalUrl.toLowerCase().trim() === normNewUrl) {
      return {
        isPossibleDuplicate: true,
        existingRecipeId: existing.id,
        existingTitle: existing.title,
        similarityScore: 1.0,
        reason: 'URL exacta coincidente.'
      };
    }

    // 3. Title high similarity check
    const titleSim = stringSimilarity(newTitle, existing.title);
    if (titleSim >= 0.75) {
      return {
        isPossibleDuplicate: true,
        existingRecipeId: existing.id,
        existingTitle: existing.title,
        similarityScore: titleSim,
        reason: `Alta similitud de título (${Math.round(titleSim * 100)}%).`
      };
    }
  }

  return {
    isPossibleDuplicate: false,
    similarityScore: 0
  };
}

/**
 * Creates a URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
