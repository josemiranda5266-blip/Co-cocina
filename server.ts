import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_RECIPES } from "./src/data/initialRecipes";
import { INITIAL_CATEGORIES } from "./src/data/categories";
import { connectorRegistry } from "./src/connectors/SourceConnector";
import { checkDuplicate, calculateQualityScore, generateSlug } from "./src/services/collectorService";
import { Recipe, Report, SearchFilters, PantryMatchResult } from "./src/types";

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // In-memory persistent database store
  let recipesStore: Recipe[] = [];
  let reportsStore: Report[] = [];
  let recentSearchesStore: { query: string; count: number; lastSearched: string }[] = [];

  // Initialize Gemini AI SDK (Server-Side Only)
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // 1. GET /api/categories
  app.get("/api/categories", (req, res) => {
    res.json({ categories: INITIAL_CATEGORIES });
  });

  // 2. GET /api/recipes
  app.get("/api/recipes", (req, res) => {
    const {
      query,
      category,
      ingredient,
      difficulty,
      maxTime,
      cuisine,
      vegetarian,
      vegan,
      glutenFree,
      budget,
      quick,
      healthy,
      sortBy,
      status
    } = req.query;

    let filtered = [...recipesStore];

    // Filter by status (default ACTIVE for non-admin)
    const targetStatus = (status as string) || 'ACTIVE';
    if (targetStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === targetStatus);
    }

    if (query && typeof query === 'string' && query.trim()) {
      const q = query.toLowerCase().trim();
      // Record search query for analytics
      const existingQuery = recentSearchesStore.find(s => s.query.toLowerCase() === q);
      if (existingQuery) {
        existingQuery.count++;
        existingQuery.lastSearched = new Date().toISOString();
      } else {
        recentSearchesStore.push({ query: q, count: 1, lastSearched: new Date().toISOString() });
      }

      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q)) ||
        r.categories.some(c => c.toLowerCase().includes(q)) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.video.author.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string') {
      filtered = filtered.filter(r =>
        r.categories.some(c => c.toLowerCase() === category.toLowerCase()) ||
        (r.subcategories && r.subcategories.some(sc => sc.toLowerCase() === category.toLowerCase()))
      );
    }

    if (ingredient && typeof ingredient === 'string') {
      const ing = ingredient.toLowerCase();
      filtered = filtered.filter(r =>
        r.ingredients.some(i => i.name.toLowerCase().includes(ing))
      );
    }

    if (difficulty && typeof difficulty === 'string') {
      filtered = filtered.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (maxTime && !isNaN(Number(maxTime))) {
      const limit = Number(maxTime);
      filtered = filtered.filter(r => (r.prepTimeMinutes || 60) <= limit);
    }

    if (vegetarian === 'true') filtered = filtered.filter(r => r.dietaryBadges?.vegetarian);
    if (vegan === 'true') filtered = filtered.filter(r => r.dietaryBadges?.vegan);
    if (glutenFree === 'true') filtered = filtered.filter(r => r.dietaryBadges?.glutenFree);
    if (budget === 'true') filtered = filtered.filter(r => r.dietaryBadges?.budget);
    if (quick === 'true') filtered = filtered.filter(r => r.dietaryBadges?.quick);
    if (healthy === 'true') filtered = filtered.filter(r => r.dietaryBadges?.healthy);

    // Sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.viewsInternal - a.viewsInternal);
    } else if (sortBy === 'score') {
      filtered.sort((a, b) => b.qualityScore - a.qualityScore);
    }

    res.json({ recipes: filtered, total: filtered.length });
  });

  // 3. GET /api/recipes/:id
  app.get("/api/recipes/:id", (req, res) => {
    const recipe = recipesStore.find(r => r.id === req.params.id || r.slug === req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    // Increment internal view count
    recipe.viewsInternal++;
    res.json({ recipe });
  });

  // 4. POST /api/collector/import (ConCocina Collector Pipeline)
  app.post("/api/collector/import", async (req, res) => {
    try {
      const { url, autoApprove } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "Se requiere una URL válida para la importación." });
      }

      // Step 1: Connector validation & Metadata Fetch
      const connector = connectorRegistry.getConnector(url);
      if (!connector.validateUrl(url)) {
        return res.status(400).json({ error: "Formato de URL no reconocido o no soportado." });
      }

      const fetchedMeta = await connector.fetchMetadata(url);

      // Step 2: Check for Duplicates
      const duplicateCheck = checkDuplicate(
        fetchedMeta.originalUrl,
        fetchedMeta.externalId,
        fetchedMeta.rawTitle,
        recipesStore
      );

      // Step 3: AI Classification via Gemini 3.8 Flash
      let aiAnalysis = {
        ingredients: ["pollo", "sal"],
        categories: ["Carnes"],
        subcategory: "General",
        difficulty: "Fácil" as const,
        estimatedDuration: fetchedMeta.duration || "30 min",
        mealType: "Almuerzo/Cena",
        cuisine: "Internacional",
        confidence: 0.85,
        model: "gemini-3.8-flash",
        analyzedAt: new Date().toISOString(),
        summary: fetchedMeta.rawDescription.substring(0, 200),
        tags: [fetchedMeta.source, "cocina", "receta"],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isBudgetFriendly: true,
        isQuick: true,
        isHealthy: true
      };

      const ai = getAiClient();
      if (ai) {
        try {
          const prompt = `Analiza el siguiente video de cocina y genera su estructuración taxonómica gastronómica en JSON:
Título: "${fetchedMeta.rawTitle}"
Descripción: "${fetchedMeta.rawDescription}"
Fuente: "${fetchedMeta.source}"

Genera una respuesta JSON estricta con estas propiedades:
- ingredients: lista de strings con nombres en español de ingredientes detectados o probables (ej. ["pollo", "papas", "aceite", "ajo"]).
- categories: lista con 1 o 2 categorías principales entre estas permitidas: ["Carnes", "Pollo", "Cerdo", "Pescados", "Mariscos", "Pastas", "Arroces", "Pizza", "Empanadas", "Hamburguesas", "Ensaladas", "Sopas", "Guisos", "Asados", "Sándwiches", "Tortas", "Budines", "Galletas", "Panes", "Postres", "Helados", "Desayunos", "Meriendas", "Bebidas", "Salsas", "Conservas"].
- subcategory: string breve con el tipo de plato específico (ej. "Pollo al horno", "Milanesas", "Fugazzeta").
- difficulty: uno de "Fácil", "Media", "Avanzada".
- estimatedDuration: tiempo estimado en texto corto (ej. "45 min").
- mealType: "Almuerzo/Cena", "Desayuno", "Merienda" o "Postre".
- cuisine: país o región de origen gastronómico (ej. "Argentina", "Italiana", "Mexicana", "Internacional").
- summary: resumen apetitoso de 2 oraciones.
- tags: lista de 5 a 8 etiquetas en minúsculas.
- isVegetarian: boolean.
- isVegan: boolean.
- isGlutenFree: boolean.
- isBudgetFriendly: boolean.
- isQuick: boolean (menos de 30 min).
- isHealthy: boolean.`;

          const aiRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                  subcategory: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimatedDuration: { type: Type.STRING },
                  mealType: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  isVegetarian: { type: Type.BOOLEAN },
                  isVegan: { type: Type.BOOLEAN },
                  isGlutenFree: { type: Type.BOOLEAN },
                  isBudgetFriendly: { type: Type.BOOLEAN },
                  isQuick: { type: Type.BOOLEAN },
                  isHealthy: { type: Type.BOOLEAN }
                },
                required: ["ingredients", "categories", "difficulty", "estimatedDuration", "summary"]
              }
            }
          });

          if (aiRes.text) {
            const parsed = JSON.parse(aiRes.text);
            aiAnalysis = {
              ...aiAnalysis,
              ingredients: parsed.ingredients || aiAnalysis.ingredients,
              categories: parsed.categories || aiAnalysis.categories,
              subcategory: parsed.subcategory || aiAnalysis.subcategory,
              difficulty: (['Fácil', 'Media', 'Avanzada'].includes(parsed.difficulty) ? parsed.difficulty : 'Fácil') as any,
              estimatedDuration: parsed.estimatedDuration || aiAnalysis.estimatedDuration,
              mealType: parsed.mealType || aiAnalysis.mealType,
              cuisine: parsed.cuisine || aiAnalysis.cuisine,
              summary: parsed.summary || aiAnalysis.summary,
              tags: parsed.tags || aiAnalysis.tags,
              isVegetarian: Boolean(parsed.isVegetarian),
              isVegan: Boolean(parsed.isVegan),
              isGlutenFree: Boolean(parsed.isGlutenFree),
              isBudgetFriendly: Boolean(parsed.isBudgetFriendly),
              isQuick: Boolean(parsed.isQuick),
              isHealthy: Boolean(parsed.isHealthy)
            };
          }
        } catch (aiErr) {
          console.error("Error running Gemini AI analysis:", aiErr);
        }
      }

      // Format ingredients distinguishing confirmed vs AI-inferred
      const formattedIngredients = aiAnalysis.ingredients.map((ing, index) => ({
        name: ing,
        amount: index === 0 ? "Porción principal" : "c/n",
        isConfirmed: false // Inferred by AI unless provided by author
      }));

      // Calculate initial Quality Score
      const newRecipePartial: Partial<Recipe> = {
        title: fetchedMeta.rawTitle,
        description: fetchedMeta.rawDescription || aiAnalysis.summary,
        video: {
          source: fetchedMeta.source,
          externalId: fetchedMeta.externalId,
          originalUrl: fetchedMeta.originalUrl,
          embedUrl: fetchedMeta.embedUrl,
          thumbnailUrl: fetchedMeta.thumbnailUrl,
          author: fetchedMeta.author,
          authorUrl: fetchedMeta.authorUrl,
          duration: aiAnalysis.estimatedDuration,
          publishedAt: fetchedMeta.publishedAt,
          viewCount: fetchedMeta.viewCount
        },
        ingredients: formattedIngredients,
        categories: aiAnalysis.categories,
        cuisine: aiAnalysis.cuisine,
        duration: aiAnalysis.estimatedDuration
      };

      const qualityFactors = calculateQualityScore(newRecipePartial, duplicateCheck.isPossibleDuplicate, 0);

      const status: Recipe['status'] = duplicateCheck.isPossibleDuplicate
        ? 'PENDING_REVIEW'
        : (autoApprove ? 'ACTIVE' : 'PENDING_REVIEW');

      const id = 'rec-' + Date.now();
      const slug = generateSlug(fetchedMeta.rawTitle) + '-' + id.substring(4, 8);

      const newRecipe: Recipe = {
        id,
        title: fetchedMeta.rawTitle,
        slug,
        description: fetchedMeta.rawDescription || aiAnalysis.summary,
        video: {
          source: fetchedMeta.source,
          externalId: fetchedMeta.externalId,
          originalUrl: fetchedMeta.originalUrl,
          embedUrl: fetchedMeta.embedUrl,
          thumbnailUrl: fetchedMeta.thumbnailUrl,
          author: fetchedMeta.author,
          authorUrl: fetchedMeta.authorUrl,
          duration: aiAnalysis.estimatedDuration,
          publishedAt: fetchedMeta.publishedAt,
          viewCount: fetchedMeta.viewCount
        },
        ingredients: formattedIngredients,
        categories: aiAnalysis.categories,
        subcategories: aiAnalysis.subcategory ? [aiAnalysis.subcategory] : [],
        tags: aiAnalysis.tags,
        difficulty: aiAnalysis.difficulty,
        duration: aiAnalysis.estimatedDuration,
        prepTimeMinutes: parseInt(aiAnalysis.estimatedDuration) || 30,
        servings: 4,
        cuisine: aiAnalysis.cuisine,
        language: 'es',
        country: aiAnalysis.cuisine,
        dietaryBadges: {
          vegetarian: aiAnalysis.isVegetarian,
          vegan: aiAnalysis.isVegan,
          glutenFree: aiAnalysis.isGlutenFree,
          budget: aiAnalysis.isBudgetFriendly,
          quick: aiAnalysis.isQuick,
          healthy: aiAnalysis.isHealthy
        },
        aiMetadata: aiAnalysis,
        qualityScore: qualityFactors.totalScore,
        qualityFactors,
        status,
        viewsInternal: 1,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewNotes: duplicateCheck.isPossibleDuplicate ? duplicateCheck.reason : undefined
      };

      // Store in catalog
      recipesStore.unshift(newRecipe);

      res.json({
        recipe: newRecipe,
        duplicateCheck,
        qualityFactors
      });
    } catch (err: any) {
      console.error("Error in collector import pipeline:", err);
      res.status(500).json({ error: err.message || "Error al procesar la URL con ConCocina Collector." });
    }
  });

  // 5. POST /api/ai/semantic-search
  app.post("/api/ai/semantic-search", async (req, res) => {
    try {
      const { userPrompt } = req.body;
      if (!userPrompt) return res.status(400).json({ error: "Falta el texto de búsqueda." });

      const ai = getAiClient();
      if (!ai) {
        // Fallback keyword search if no key
        const q = userPrompt.toLowerCase();
        const results = recipesStore.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some(t => t.includes(q)) ||
          r.ingredients.some(i => i.name.toLowerCase().includes(q))
        );
        return res.json({ results, explanation: "Búsqueda directa por palabras clave." });
      }

      const prompt = `El usuario busca recetas en lenguaje natural: "${userPrompt}".
Catálogo disponible:
${recipesStore.map(r => `[ID: ${r.id}] Título: "${r.title}", Ingredientes: ${r.ingredients.map(i => i.name).join(', ')}, Categorías: ${r.categories.join(', ')}, Dificultad: ${r.difficulty}, Tiempo: ${r.duration}`).join('\n')}

Selecciona los IDs de las recetas que mejor coincidan con la INTENCIÓN del usuario (incluso búsquedas complejas como "quiero hacer algo rápido con pollo y papas").

Devuelve un JSON con:
- matchingIds: array de IDs ordenados por relevancia.
- explanation: breve explicación amistosa (1 oración) de lo que comprendió la IA sobre la intención de búsqueda.`;

      const aiRes = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchingIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING }
            },
            required: ["matchingIds", "explanation"]
          }
        }
      });

      let matchingIds: string[] = [];
      let explanation = "Búsqueda semántica procesada.";

      if (aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        matchingIds = parsed.matchingIds || [];
        explanation = parsed.explanation || explanation;
      }

      const results = matchingIds
        .map(id => recipesStore.find(r => r.id === id))
        .filter((r): r is Recipe => Boolean(r) && r.status === 'ACTIVE');

      res.json({ results, explanation });
    } catch (err: any) {
      console.error("Semantic search error:", err);
      res.status(500).json({ error: "Error en la búsqueda inteligente." });
    }
  });

  // 6. POST /api/ai/pantry-search ("¿Qué tenés en casa?")
  app.post("/api/ai/pantry-search", async (req, res) => {
    try {
      const { userIngredients } = req.body; // e.g. ["pollo", "papa", "cebolla", "huevo"]
      if (!Array.isArray(userIngredients) || userIngredients.length === 0) {
        return res.status(400).json({ error: "Ingresa al menos un ingrediente." });
      }

      const userPantrySet = userIngredients.map((i: string) => i.toLowerCase().trim());

      const activeRecipes = recipesStore.filter(r => r.status === 'ACTIVE');

      const matchResults: PantryMatchResult[] = activeRecipes.map(recipe => {
        const recipeIngs = recipe.ingredients.map(i => i.name.toLowerCase().trim());

        const matched: string[] = [];
        const missing: string[] = [];

        recipeIngs.forEach(ingName => {
          const isMatch = userPantrySet.some(pantryItem =>
            ingName.includes(pantryItem) || pantryItem.includes(ingName)
          );
          if (isMatch) {
            matched.push(ingName);
          } else {
            missing.push(ingName);
          }
        });

        const matchRatio = recipeIngs.length > 0 ? matched.length / recipeIngs.length : 0;

        let matchLevel: 'GREEN' | 'YELLOW' | 'RED' = 'RED';
        if (matchRatio >= 0.6 || missing.length <= 1) {
          matchLevel = 'GREEN'; // 🟢 Tenés todos o la gran mayoría
        } else if (matchRatio >= 0.35 || missing.length <= 3) {
          matchLevel = 'YELLOW'; // 🟡 Te faltan pocos
        } else {
          matchLevel = 'RED'; // 🔴 Te faltan varios
        }

        return {
          recipe,
          matchedIngredients: matched,
          missingIngredients: missing,
          matchPercentage: Math.round(matchRatio * 100),
          matchLevel
        };
      });

      // Sort by match percentage descending
      matchResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

      res.json({ results: matchResults });
    } catch (err: any) {
      console.error("Pantry search error:", err);
      res.status(500).json({ error: "Error al evaluar despensa." });
    }
  });

  // 7. PUT /api/recipes/:id/status (Admin actions: Approve, Reject, Hide)
  app.put("/api/recipes/:id/status", (req, res) => {
    const { status, reviewNotes } = req.body;
    const recipe = recipesStore.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });

    recipe.status = status;
    recipe.updatedAt = new Date().toISOString();
    if (reviewNotes) recipe.reviewNotes = reviewNotes;

    res.json({ recipe });
  });

  // 8. POST /api/reports (Report content)
  app.post("/api/reports", (req, res) => {
    const { recipeId, reason, details } = req.body;
    const recipe = recipesStore.find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ error: "Receta no encontrada" });

    const report: Report = {
      id: 'rep-' + Date.now(),
      recipeId,
      recipeTitle: recipe.title,
      reason,
      details,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    reportsStore.push(report);

    // Recalculate Quality score
    recipe.qualityFactors = calculateQualityScore(recipe, false, reportsStore.filter(r => r.recipeId === recipeId).length);
    recipe.qualityScore = recipe.qualityFactors.totalScore;

    res.json({ report, recipeQualityScore: recipe.qualityScore });
  });

  // 9. GET /api/admin/metrics
  app.get("/api/admin/metrics", (req, res) => {
    const total = recipesStore.length;
    const active = recipesStore.filter(r => r.status === 'ACTIVE').length;
    const pending = recipesStore.filter(r => r.status === 'PENDING_REVIEW').length;
    const rejected = recipesStore.filter(r => r.status === 'REJECTED').length;
    const pendingReports = reportsStore.filter(r => r.status === 'PENDING').length;

    const topViewed = [...recipesStore]
      .sort((a, b) => b.viewsInternal - a.viewsInternal)
      .slice(0, 5)
      .map(r => ({ id: r.id, title: r.title, views: r.viewsInternal }));

    res.json({
      total,
      active,
      pending,
      rejected,
      pendingReports,
      topViewed,
      topSearches: recentSearchesStore.sort((a, b) => b.count - a.count).slice(0, 5),
      reports: reportsStore
    });
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ConCocina Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
