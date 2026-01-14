import React from 'react';

interface NavItem {
  id: string;
  label: string;
  angle: number;
}

interface MobileCompassNavProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const MobileCompassNav: React.FC<MobileCompassNavProps> = ({ items, activeSection, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/20 md:hidden">
      <div className="flex justify-around items-center h-16 px-2 safe-area-pb">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary scale-125 shadow-[0_0_10px_hsl(var(--primary))]' 
                    : 'bg-muted-foreground/50'
                }`}
              />
              <span className="text-[10px] sm:text-xs font-medium">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileCompassNav;
