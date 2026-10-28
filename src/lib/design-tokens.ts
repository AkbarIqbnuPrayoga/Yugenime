export const DESIGN_TOKENS = {
  colors: {
    // Primary Backgrounds
    voidBlack: '#090911',
    midnightIndigo: '#111126',
    nebulaNavy: '#171A35',
    twilightPurple: '#28234C',

    // Fantasy Accents
    astralViolet: '#9C7BFF',
    celestialBlue: '#78BFFF',
    auroraCyan: '#77E6E0',
    starlightSilver: '#D8D9F5',
    lunarWhite: '#F6F4FF',
    mysticPink: '#E6A5D5',
    ancientGold: '#E9CA8B',

    // Semantic Colors
    success: '#64C99A',
    warning: '#E8BE75',
    error: '#F17D91',
    neutral: '#9696B4',
  },
  typography: {
    display: "'Space Grotesk', 'Sora', sans-serif",
    body: "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  radii: {
    card: '18px',
    panel: '22px',
    button: '12px',
    pill: '9999px',
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(156, 123, 255, 0.12)',
    elevated: '0 12px 40px rgba(0, 0, 0, 0.65)',
    glowViolet: '0 0 25px rgba(156, 123, 255, 0.35)',
    glowCyan: '0 0 20px rgba(119, 230, 224, 0.35)',
  },
} as const;

export const GENRE_LIST = [
  { id: 'action', name: 'Action', color: '#9C7BFF', icon: 'Sword' },
  { id: 'adventure', name: 'Adventure', color: '#78BFFF', icon: 'Compass' },
  { id: 'fantasy', name: 'Fantasy', color: '#E6A5D5', icon: 'Sparkles' },
  { id: 'romance', name: 'Romance', color: '#FF7B9C', icon: 'Heart' },
  { id: 'mystery', name: 'Mystery', color: '#77E6E0', icon: 'Search' },
  { id: 'sci-fi', name: 'Sci-Fi', color: '#78BFFF', icon: 'Zap' },
  { id: 'slice-of-life', name: 'Slice of Life', color: '#E9CA8B', icon: 'Coffee' },
  { id: 'horror', name: 'Horror', color: '#F17D91', icon: 'Moon' },
  { id: 'comedy', name: 'Comedy', color: '#FFBE76', icon: 'Smile' },
  { id: 'drama', name: 'Drama', color: '#A55EEA', icon: 'Film' },
  { id: 'supernatural', name: 'Supernatural', color: '#9C7BFF', icon: 'Eye' },
] as const;
