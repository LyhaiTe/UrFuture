'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'urfuture-theme';

function applyTheme(isLight: boolean) {
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', !isLight);
}

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const nextIsLight = savedTheme ? savedTheme === 'light' : prefersLight;

    applyTheme(nextIsLight);
    setIsLight(nextIsLight);
  }, []);

  const toggleTheme = () => {
    const nextIsLight = !isLight;
    applyTheme(nextIsLight);
    window.localStorage.setItem(STORAGE_KEY, nextIsLight ? 'light' : 'dark');
    setIsLight(nextIsLight);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="theme-toggle"
    >
      <span aria-hidden="true">{isLight ? '☾' : '☀'}</span>
    </button>
  );
}