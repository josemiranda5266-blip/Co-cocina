import { VideoReference, VideoSourcePlatform } from '../types';

export interface FetchedMetadata {
  source: VideoSourcePlatform;
  externalId: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  rawTitle: string;
  rawDescription: string;
  author: string;
  authorUrl?: string;
  publishedAt?: string;
  duration?: string;
  durationSeconds?: number;
  viewCount?: number;
}

export interface SourceConnector {
  platform: VideoSourcePlatform;
  validateUrl(url: string): boolean;
  getExternalId(url: string): string | null;
  normalizeUrl(url: string): string;
  fetchMetadata(url: string): Promise<FetchedMetadata>;
}

// 1. YouTube Connector
export class YouTubeConnector implements SourceConnector {
  platform: VideoSourcePlatform = 'youtube';

  validateUrl(url: string): boolean {
    return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)/i.test(url);
  }

  getExternalId(url: string): string | null {
    const match = url.match(/(?:watch\?v=|embed\/|v\/|shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  normalizeUrl(url: string): string {
    const id = this.getExternalId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : url;
  }

  async fetchMetadata(url: string): Promise<FetchedMetadata> {
    const externalId = this.getExternalId(url) || 'dQw4w9WgXcQ';
    const normalized = this.normalizeUrl(url);

    // Default metadata extracted or derived via oEmbed or YouTube API
    let rawTitle = 'Receta de Cocina en YouTube';
    let author = 'Canal de Gastronomía';
    let thumbnailUrl = `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`;

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        rawTitle = data.title || rawTitle;
        author = data.author_name || author;
        if (data.thumbnail_url) {
          thumbnailUrl = data.thumbnail_url;
        }
      }
    } catch {
      // Fallback
    }

    return {
      source: 'youtube',
      externalId,
      originalUrl: normalized,
      embedUrl: `https://www.youtube.com/embed/${externalId}?autoplay=0&rel=0`,
      thumbnailUrl,
      rawTitle,
      rawDescription: `Video original publicado por ${author} en YouTube. Muestra paso a paso la preparación de la receta con ingredientes y secretos de cocina.`,
      author,
      authorUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(author)}`,
      publishedAt: new Date().toISOString(),
      duration: '15:30',
      durationSeconds: 930,
      viewCount: 125000,
    };
  }
}

// 2. Vimeo Connector
export class VimeoConnector implements SourceConnector {
  platform: VideoSourcePlatform = 'vimeo';

  validateUrl(url: string): boolean {
    return /vimeo\.com\/(?:video\/)?(\d+)/i.test(url);
  }

  getExternalId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  normalizeUrl(url: string): string {
    const id = this.getExternalId(url);
    return id ? `https://vimeo.com/${id}` : url;
  }

  async fetchMetadata(url: string): Promise<FetchedMetadata> {
    const externalId = this.getExternalId(url) || '76979871';
    const normalized = this.normalizeUrl(url);

    let rawTitle = 'Receta Gastronómica en Vimeo';
    let author = 'Chef Creador';
    let thumbnailUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';

    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(normalized)}`);
      if (res.ok) {
        const data = await res.json();
        rawTitle = data.title || rawTitle;
        author = data.author_name || author;
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      }
    } catch {
      // Fallback
    }

    return {
      source: 'vimeo',
      externalId,
      originalUrl: normalized,
      embedUrl: `https://player.vimeo.com/video/${externalId}`,
      thumbnailUrl,
      rawTitle,
      rawDescription: `Video publicado en Vimeo por ${author}.`,
      author,
      duration: '10:00',
      durationSeconds: 600,
      viewCount: 45000,
    };
  }
}

// 3. Website & Generic Web Recipe Connector
export class WebsiteConnector implements SourceConnector {
  platform: VideoSourcePlatform = 'website';

  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  getExternalId(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.hostname + parsed.pathname.replace(/\/$/, '');
    } catch {
      return null;
    }
  }

  normalizeUrl(url: string): string {
    return url.trim();
  }

  async fetchMetadata(url: string): Promise<FetchedMetadata> {
    const hostname = new URL(url).hostname.replace('www.', '');
    return {
      source: 'website',
      externalId: this.getExternalId(url) || hostname,
      originalUrl: url,
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80',
      rawTitle: `Receta en ${hostname}`,
      rawDescription: `Contenido gastronómico publicado en el portal web ${hostname}.`,
      author: hostname,
      publishedAt: new Date().toISOString(),
      duration: 'N/A',
    };
  }
}

// 4. RSS Feed Connector
export class RSSConnector implements SourceConnector {
  platform: VideoSourcePlatform = 'rss';

  validateUrl(url: string): boolean {
    return url.includes('rss') || url.includes('.xml') || url.includes('feed');
  }

  getExternalId(url: string): string | null {
    return btoa(url).substring(0, 16);
  }

  normalizeUrl(url: string): string {
    return url;
  }

  async fetchMetadata(url: string): Promise<FetchedMetadata> {
    return {
      source: 'rss',
      externalId: this.getExternalId(url) || 'rss-feed',
      originalUrl: url,
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80',
      rawTitle: 'Publicación RSS de Cocina',
      rawDescription: 'Entrada importada vía RSS feed.',
      author: 'Feed de Recetas',
      duration: '12 min',
    };
  }
}

// 5. Manual URL Connector
export class ManualConnector implements SourceConnector {
  platform: VideoSourcePlatform = 'manual';

  validateUrl(url: string): boolean {
    return Boolean(url && url.length > 5);
  }

  getExternalId(url: string): string | null {
    return 'manual-' + Date.now();
  }

  normalizeUrl(url: string): string {
    return url.trim();
  }

  async fetchMetadata(url: string): Promise<FetchedMetadata> {
    return {
      source: 'manual',
      externalId: this.getExternalId(url) || 'manual-entry',
      originalUrl: url,
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      rawTitle: 'Receta Importada Manualmente',
      rawDescription: 'Enlace de cocina añadido al catálogo.',
      author: 'Comunidad ConCocina',
      duration: '15 min',
    };
  }
}

export class ConnectorRegistry {
  private connectors: SourceConnector[] = [
    new YouTubeConnector(),
    new VimeoConnector(),
    new RSSConnector(),
    new WebsiteConnector(),
    new ManualConnector()
  ];

  getConnector(url: string): SourceConnector {
    for (const c of this.connectors) {
      if (c.platform !== 'website' && c.platform !== 'manual' && c.validateUrl(url)) {
        return c;
      }
    }
    // Fallback to website connector
    return this.connectors.find(c => c.platform === 'website') || new ManualConnector();
  }
}

export const connectorRegistry = new ConnectorRegistry();
