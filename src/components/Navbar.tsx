import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Users, Compass } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Explorer', icon: Compass },
    { to: '/speakers', label: 'Speakers', icon: Users },
    { to: '/agenda', label: 'My Agenda', icon: Bookmark },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-surface border-b border-border/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary font-sans">🇮🇳 AI Summit</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">2026</span>
        </Link>
        <div className="flex gap-1">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
