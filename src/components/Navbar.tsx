import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Users, Compass, Moon, Sun, MapPinned } from 'lucide-react';

type Theme = 'light' | 'dark';

export function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'light' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const links = [
    { to: '/', label: 'Explorer', icon: Compass },
    { to: '/explore-delhi', label: 'Explore Delhi', icon: MapPinned },
    { to: '/speakers', label: 'Speakers', icon: Users },
    { to: '/agenda', label: 'My Agenda', icon: Bookmark },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-surface border-b border-border/30 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold text-primary font-sans">India AI Summit</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">2026</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <link.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
