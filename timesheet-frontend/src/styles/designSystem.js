// Design System CSS Variables - Windows 11 Inspired
// Colors: Primary #0078D4 (Win11 Blue), Surface #FFFFFF, Background #F3F3F3
// Typography: Segoe UI Variable, Rounded corners 8px, Elevation shadows, Mica/Acrylic effects

export const designSystem = {
  colors: {
    primary: '#d245f2',
    primaryDark: '#9b3bc7',
    primaryLight: '#e0a0fd',
    primaryHover: '#d938f9',
    secondary: '#b0f01a',
    secondaryDark: '#e4ed2f',
    background: '#f0f1f9',
    backgroundAlt: '#ddf9aa',
    surface: '#FFFFFF',
    surfaceHover: '#29e26d',
    surfacePressed: '#b4cbf1',
    text: '#1B1B1B',
    textSecondary: '#616161',
    textDisabled: '#A1A1A1',
    error: '#f32a2a',
    errorLight: '#efc2c5',
    success: '#107C10',
    successLight: '#d2f5cf',
    warning: '#d44329',
    warningLight: '#FFF4E8',
    divider: '#E1E1E1',
    dividerStrong: '#CCCCCC',
    white: '#FFFFFF',
    black: '#1B1B1B',
    // Windows 11 Mica/Acrylic
    micaLight: 'rgba(255, 255, 255, 0.85)',
    micaDark: 'rgba(32, 32, 32, 0.85)',
    acrylicLight: 'rgba(255, 255, 255, 0.6)',
    acrylicDark: 'rgba(32, 32, 32, 0.6)',
  },
  typography: {
    h1: { fontSize: '20px', fontWeight: 600, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.02em' },
    h2: { fontSize: '16px', fontWeight: 600, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.01em' },
    h3: { fontSize: '14px', fontWeight: 600, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif' },
    body: { fontSize: '14px', fontWeight: 400, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1.5 },
    bodyStrong: { fontSize: '14px', fontWeight: 500, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1.5 },
    caption: { fontSize: '12px', fontWeight: 400, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1.5 },
    captionStrong: { fontSize: '12px', fontWeight: 500, fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif', lineHeight: 1.5 },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    // Windows 11 elevation system
    elevation1: '0 1px 2px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.03)',
    elevation4: '0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.05)',
    elevation8: '0 4px 8px rgba(0,0,0,0.07), 0 8px 16px rgba(0,0,0,0.06)',
    elevation16: '0 8px 16px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.07)',
    elevation64: '0 16px 32px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.08)',
    // Inner shadows for pressed states
    inset: 'inset 0 1px 2px rgba(0,0,0,0.08)',
    // Focus ring
    focus: '0 0 0 2px #FFFFFF, 0 0 0 4px #0078D4',
  },
  transitions: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
  },
};

export const globalStyles = {
  // Windows 11 card variants
  card: {
    background: designSystem.colors.surface,
    borderRadius: designSystem.radius.md,
    boxShadow: designSystem.shadows.elevation4,
    border: `1px solid ${designSystem.colors.divider}`,
    padding: designSystem.spacing.md,
    transition: `box-shadow ${designSystem.transitions.normal}, border-color ${designSystem.transitions.fast}`,
  },
  cardElevated: {
    background: designSystem.colors.surface,
    borderRadius: designSystem.radius.lg,
    boxShadow: designSystem.shadows.elevation8,
    border: `1px solid ${designSystem.colors.divider}`,
    padding: designSystem.spacing.md,
  },
  cardOutlined: {
    background: 'transparent',
    borderRadius: designSystem.radius.md,
    boxShadow: 'none',
    border: `1px solid ${designSystem.colors.dividerStrong}`,
    padding: designSystem.spacing.md,
  },
  // Mica/Acrylic backdrop cards
  cardMica: {
    background: designSystem.colors.micaLight,
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: designSystem.radius.md,
    boxShadow: designSystem.shadows.elevation4,
    border: `1px solid ${designSystem.colors.divider}`,
    padding: designSystem.spacing.md,
  },
  cardAcrylic: {
    background: designSystem.colors.acrylicLight,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: designSystem.radius.lg,
    boxShadow: designSystem.shadows.elevation8,
    border: `1px solid rgba(255,255,255,0.2)`,
    padding: designSystem.spacing.md,
  },

  button: {
    primary: {
      background: designSystem.colors.primary,
      color: designSystem.colors.white,
      border: 'none',
      borderRadius: designSystem.radius.md,
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
      boxShadow: designSystem.shadows.elevation1,
      transition: `all ${designSystem.transitions.fast}`,
      minHeight: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: designSystem.spacing.xs,
    },
    secondary: {
      background: 'transparent',
      color: designSystem.colors.primary,
      border: `1px solid ${designSystem.colors.dividerStrong}`,
      borderRadius: designSystem.radius.md,
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
      transition: `all ${designSystem.transitions.fast}`,
      minHeight: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: designSystem.spacing.xs,
    },
    subtle: {
      background: 'transparent',
      color: designSystem.colors.text,
      border: 'none',
      borderRadius: designSystem.radius.md,
      padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 400,
      fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
      transition: `all ${designSystem.transitions.fast}`,
      minHeight: '32px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: designSystem.spacing.xs,
    },
    danger: {
      background: designSystem.colors.error,
      color: designSystem.colors.white,
      border: 'none',
      borderRadius: designSystem.radius.md,
      padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
      boxShadow: designSystem.shadows.elevation1,
      transition: `all ${designSystem.transitions.fast}`,
      minHeight: '36px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: designSystem.spacing.xs,
    },
  },

  input: {
    width: '100%',
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    borderRadius: designSystem.radius.md,
    border: `1px solid ${designSystem.colors.divider}`,
    fontSize: '14px',
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    boxSizing: 'border-box',
    background: designSystem.colors.surface,
    color: designSystem.colors.text,
    transition: `all ${designSystem.transitions.fast}`,
    minHeight: '36px',
    outline: 'none',
  },
  inputFocus: {
    borderColor: designSystem.colors.primary,
    boxShadow: designSystem.shadows.focus,
  },
  inputError: {
    borderColor: designSystem.colors.error,
    boxShadow: `0 0 0 2px #FFFFFF, 0 0 0 4px ${designSystem.colors.error}`,
  },

  select: {
    width: '100%',
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    borderRadius: designSystem.radius.md,
    border: `1px solid ${designSystem.colors.divider}`,
    fontSize: '14px',
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    boxSizing: 'border-box',
    background: designSystem.colors.surface,
    color: designSystem.colors.text,
    cursor: 'pointer',
    transition: `all ${designSystem.transitions.fast}`,
    minHeight: '36px',
    appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23616161' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px',
    paddingRight: '40px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: designSystem.shadows.elevation1,
    background: designSystem.colors.surface,
  },
  tableWrapper: {
    borderRadius: designSystem.radius.md,
    overflow: 'hidden',
    boxShadow: designSystem.shadows.elevation1,
  },
  tableHeader: {
    background: designSystem.colors.backgroundAlt,
    color: designSystem.colors.textSecondary,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${designSystem.colors.divider}`,
    whiteSpace: 'break-spaces',
  },
  tableheadercell:{
    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
  },
  tableCell: {
    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
    fontSize: '14px',
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    borderBottom: `1px solid ${designSystem.colors.divider}`,
    color: designSystem.colors.text,
    verticalAlign: 'middle',
  },
  tableRow: {
    transition: `background-color ${designSystem.transitions.fast}`,
  },
  tableRowHover: {
    background: designSystem.colors.surfaceHover,
  },
  tableRowSelected: {
    background: 'rgba(0, 120, 212, 0.08)',
  },
  tableRowStriped: (index) => ({
    background: index % 2 === 0 ? designSystem.colors.surface : designSystem.colors.backgroundAlt,
  }),

  // Layout utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },

  // Focus visible for accessibility
  focusVisible: {
    outline: 'none',
    boxShadow: designSystem.shadows.focus,
  },

  // Scrollbar styling
  scrollbar: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${designSystem.colors.dividerStrong} transparent`,
  },
  scrollbarStyled: {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: designSystem.colors.dividerStrong,
      borderRadius: '4px',
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: designSystem.colors.textDisabled,
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
  },

  // Animation keyframes (to be injected globally)
  animations: {
    fadeIn: 'fadeIn 160ms cubic-bezier(0.4, 0, 0.2, 1)',
    scaleIn: 'scaleIn 160ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideUp: 'slideUp 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideDown: 'slideDown 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    pulse: 'pulse 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
    shimmer: 'shimmer 1500ms linear infinite',
  },
};

export const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

export default designSystem;