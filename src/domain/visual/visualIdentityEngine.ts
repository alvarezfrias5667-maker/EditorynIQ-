import { VisualIdentityProfile } from './visualTypes';

export function getDefaultVisualIdentity(
  bookId: string,
  bookTitle: string,
  genre: string = 'non-fiction',
  language: 'en' | 'es' = 'en'
): VisualIdentityProfile {
  let palette = {
    primary: '#081629',
    secondary: '#101F37',
    accent: '#345CFF',
    dark: '#081629',
    light: '#F6F8FC',
    background: '#FFFFFF',
  };

  let typography = {
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'DM Sans',
    monoFont: 'JetBrains Mono',
  };

  let styleName: VisualIdentityProfile['styleName'] = 'modern-technical';

  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('fiction') || lowerGenre.includes('literature') || lowerGenre.includes('history')) {
    styleName = 'classic-serif';
    palette = {
      primary: '#1A1412',
      secondary: '#2C221E',
      accent: '#E9BC72',
      dark: '#1A1412',
      light: '#FAF8F5',
      background: '#FFFFFF',
    };
    typography = {
      headingFont: 'Playfair Display',
      bodyFont: 'Lora',
      monoFont: 'IBM Plex Mono',
    };
  } else if (lowerGenre.includes('design') || lowerGenre.includes('art') || lowerGenre.includes('creative')) {
    styleName = 'vibrant-digital';
    palette = {
      primary: '#081629',
      secondary: '#101F37',
      accent: '#16C8BA',
      dark: '#081629',
      light: '#F0FDFB',
      background: '#FFFFFF',
    };
  }

  return {
    bookId,
    palette,
    typography,
    styleName,
    proportions: '6x9',
    language,
    editorialProfile: `${genre.toUpperCase()} Editorial Standard`,
    authorPreferences: `High contrast visual assets adhering to Enterprise Infinity™ guidelines. Title: "${bookTitle}".`,
    consistencyRules: [
      'Maintain primary accent color across all data charts and infographics.',
      'Use high-contrast legible vector typography on cover and diagrams.',
      'Ensure standard 6x9 proportion ratio and 0.057mm per page spine allowance.',
      'All illustrations must carry explicit author rights declarations.',
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function validateVisualIdentity(profile: Partial<VisualIdentityProfile>): string[] {
  const errors: string[] = [];
  if (!profile.palette?.primary) errors.push('Primary color is required.');
  if (!profile.palette?.accent) errors.push('Accent color is required.');
  if (!profile.typography?.headingFont) errors.push('Heading font is required.');
  return errors;
}
