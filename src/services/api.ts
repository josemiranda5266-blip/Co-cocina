import { Recipe, Category, SearchFilters, PantryMatchResult, Report } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Error al obtener categorías');
  const data = await res.json();
  return data.categories;
}

export async function fetchRecipes(filters?: Partial<SearchFilters> & { status?: string }): Promise<{ recipes: Recipe[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.query) params.append('query', filters.query);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.ingredient) params.append('ingredient', filters.ingredient);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.maxTimeMinutes) params.append('maxTime', String(filters.maxTimeMinutes));
  if (filters?.isVegetarian) params.append('vegetarian', 'true');
  if (filters?.isVegan) params.append('vegan', 'true');
  if (filters?.isGlutenFree) params.append('glutenFree', 'true');
  if (filters?.isBudget) params.append('budget', 'true');
  if (filters?.isQuick) params.append('quick', 'true');
  if (filters?.isHealthy) params.append('healthy', 'true');
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.status) params.append('status', filters.status);

  const res = await fetch(`/api/recipes?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar recetas');
  return res.json();
}

export async function fetchRecipeById(idOrSlug: string): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error('Receta no encontrada');
  const data = await res.json();
  return data.recipe;
}

export async function importRecipeUrl(url: string, autoApprove = false): Promise<{ recipe: Recipe; duplicateCheck: any; qualityFactors: any }> {
  const res = await fetch('/api/collector/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, autoApprove })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al importar receta con ConCocina Collector');
  }
  return res.json();
}

export async function performSemanticSearch(userPrompt: string): Promise<{ results: Recipe[]; explanation: string }> {
  const res = await fetch('/api/ai/semantic-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt })
  });
  if (!res.ok) throw new Error('Error en búsqueda inteligente');
  return res.json();
}

export async function performPantrySearch(userIngredients: string[]): Promise<{ results: PantryMatchResult[] }> {
  const res = await fetch('/api/ai/pantry-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIngredients })
  });
  if (!res.ok) throw new Error('Error al buscar recetas con tu despensa');
  return res.json();
}

export async function updateRecipeStatus(id: string, status: Recipe['status'], reviewNotes?: string): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reviewNotes })
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  const data = await res.json();
  return data.recipe;
}

export async function submitReport(recipeId: string, reason: string, details?: string): Promise<{ report: Report; recipeQualityScore: number }> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId, reason, details })
  });
  if (!res.ok) throw new Error('Error al enviar el reporte');
  return res.json();
}

export async function fetchAdminMetrics(): Promise<any> {
  const res = await fetch('/api/admin/metrics');
  if (!res.ok) throw new Error('Error al cargar métricas de administración');
  return res.json();
}
