import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { getData, saveData } from '../utils/storage';

const ThemeContext = createContext();

export const lightColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6C6C70',
  border: '#E5E5EA',
  error: '#FF3B30',
};

export const darkColors = {
  background: '#121212',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#38383A',
  error: '#FF453A',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeColor, setThemeColor] = useState('#a270ff'); 
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const savedColor = await getData('@app_theme_color');
      const savedMode = await getData('@app_theme_mode');
      
      if (savedColor) setThemeColor(savedColor);
      if (savedMode !== null) {
        setIsDark(savedMode === 'dark');
      } else {
        setIsDark(systemColorScheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const changeThemeColor = async (color) => {
    setThemeColor(color);
    await saveData('@app_theme_color', color);
  };

  const toggleDarkMode = async (dark) => {
    setIsDark(dark);
    await saveData('@app_theme_mode', dark ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeColor, changeThemeColor, isDark, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);