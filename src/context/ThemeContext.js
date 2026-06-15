import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { getData, saveData } from '../utils/storage';

// Import your modernized central THEMES config matrix
import { THEMES } from '../styles/theme'; 

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  // Track theme configurations by dictionary identifier name
  const [themeName, setThemeName] = useState('default'); 
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadThemeSettings = async () => {
      const savedThemeName = await getData('@app_theme_name');
      const savedMode = await getData('@app_theme_mode');
      
      if (savedThemeName && THEMES[savedThemeName]) {
        setThemeName(savedThemeName);
      }
      
      if (savedMode !== null) {
        setIsDark(savedMode === 'dark');
      } else {
        // Fall back to system configuration settings if no cache exists
        setIsDark(systemColorScheme === 'dark');
      }
    };
    loadThemeSettings();
  }, [systemColorScheme]);

  // Swaps the active base layout variations (e.g., 'default', 'ocean', etc.)
  const changeTheme = async (name) => {
    if (THEMES[name]) {
      setThemeName(name);
      await saveData('@app_theme_name', name);
    }
  };

  // Switches between Dark and Light palettes
  const toggleDarkMode = async (dark) => {
    setIsDark(dark);
    await saveData('@app_theme_mode', dark ? 'dark' : 'light');
  };

  // Resolve the current active color dictionary map dynamically
  const targetThemeConfig = THEMES[themeName] || THEMES.default;
  const colors = isDark ? targetThemeConfig.dark : targetThemeConfig.light;

  return (
    <ThemeContext.Provider value={{ 
      themeName, 
      changeTheme, 
      isDark, 
      toggleDarkMode, 
      colors,
      
      // Backward Compatibility Bridge:
      // Maps themeColor directly into your current theme's primary color 
      // so your buttons and components won't crash while you refactor them out later.
      themeColor: colors.primary 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);