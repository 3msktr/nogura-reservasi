
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    // Default to light
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full hover:bg-secondary transition-colors"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
    </Button>
  );
};

export default ThemeToggle;
