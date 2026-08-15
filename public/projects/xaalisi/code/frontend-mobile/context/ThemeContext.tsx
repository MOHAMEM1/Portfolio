import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSecureItem, setSecureItem } from '@/config/storage';

export type AppTheme = 'dark' | 'light';

// Strict Luxury Theme: Black, White, Gray, Yellow, Gold (with Green/Red for transactions)
export const COLORS = {
  light: {
    bg: '#FFFFFF',
    surface: '#F8F9FA',
    activeToken: '#D4AF37', // Gold
    inactiveToken: '#A3A3A3', // Neutral Gray
    border: '#E5E5E5', // Neutral light Gray
    textPrimary: '#000000', // Black
    textSecondary: '#525252', // Neutral dark Gray
    background: '#FFFFFF',
    primary: '#D4AF37', // Gold
    secondary: '#FACC15', // Yellow
    success: '#10B981',
    danger: '#EF4444',
    fontFamily: 'Inter_500Medium', // ONE unified font
  },
  dark: {
    bg: '#000000', // Deep Black
    surface: '#111111', // Dark Gray
    activeToken: '#D4AF37', // Gold
    inactiveToken: '#737373', // Neutral Gray
    border: '#262626', // Neutral dark Gray border
    textPrimary: '#FFFFFF', // White
    textSecondary: '#A3A3A3', // Neutral light Gray text
    background: '#000000', // Deep Black
    primary: '#D4AF37', // Gold
    secondary: '#FACC15', // Yellow
    success: '#10B981',
    danger: '#EF4444',
    fontFamily: 'Inter_500Medium', // ONE unified font
  },
};

interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  colors: typeof COLORS['dark'];
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark', // Default to luxury dark theme
  toggleTheme: () => {},
  colors: COLORS.dark,
  isDark: true,
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('dark'); // Force dark by default for 2026 luxury

  useEffect(() => {
    getSecureItem('appTheme').then(savedTheme => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme as AppTheme);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      setSecureItem('appTheme', newTheme);
      return newTheme;
    });
  }, []);

  const isDark = theme === 'dark';
  const colors = COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
