import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AccessibilityContextType {
  colorblindMode: boolean;
  toggleColorblindMode: () => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  textSize: 'normal' | 'large' | 'extra-large';
  setTextSize: (size: 'normal' | 'large' | 'extra-large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Try to load preferences from localStorage
  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('colorblindMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('highContrastMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [textSize, setTextSize] = useState<'normal' | 'large' | 'extra-large'>(() => {
    const saved = localStorage.getItem('textSize');
    return (saved as 'normal' | 'large' | 'extra-large') || 'normal';
  });

  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('colorblindMode', JSON.stringify(colorblindMode));

    // Apply colorblind mode to body class to enable global CSS styling
    if (colorblindMode) {
      document.body.classList.add('colorblind-mode');
    } else {
      document.body.classList.remove('colorblind-mode');
    }
  }, [colorblindMode]);

  useEffect(() => {
    localStorage.setItem('highContrastMode', JSON.stringify(highContrastMode));

    if (highContrastMode) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrastMode]);

  useEffect(() => {
    localStorage.setItem('textSize', textSize);

    // Remove all text size classes first
    document.body.classList.remove('text-size-normal', 'text-size-large', 'text-size-extra-large');
    // Add the current text size class
    document.body.classList.add(`text-size-${textSize}`);
  }, [textSize]);

  const toggleColorblindMode = () => {
    setColorblindMode(prev => !prev);
  };

  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };

  const handleSetTextSize = (size: 'normal' | 'large' | 'extra-large') => {
    setTextSize(size);
  };

  const value = {
    colorblindMode,
    toggleColorblindMode,
    highContrastMode,
    toggleHighContrastMode,
    textSize,
    setTextSize: handleSetTextSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;
