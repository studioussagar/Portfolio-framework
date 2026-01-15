import React, { useEffect, useRef, useState, useCallback } from 'react';

interface NavItem {
  id: string;
  label: string;
  angle: number;
}

interface CompassNavProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  orientation?: 'right' | 'top'; // right = right semicircle, top = top semicircle (for bottom nav)
}

const CompassNav: React.FC<CompassNavProps> = ({ 
  items, 
  activeSection, 
  onNavigate, 
  orientation = 'right' 
}) => {
  const rotatorRef = useRef<SVGGElement>(null);
  const [currentAngle, setCurrentAngle] = useState(60);
  const velocityRef = useRef(0);
  const targetRef = useRef(60);
  const animationFrameRef = useRef<number>();

  // Transform angles based on orientation for needle rotation
  // Right semicircle: angles from +90 to -90 (original)
  // Top semicircle: angles from 180 to 0 - needle points upward into the arc
  const transformAngle = useCallback((angle: number) => {
    if (orientation === 'top') {
      // For top orientation: rotate needle to point upward
      // angle 60 should point to upper-left, angle -60 to upper-right
      return angle - 90;
    }
    return angle;
  }, [orientation]);

  const sectionAngles: Record<string, number> = {};
  items.forEach(item => {
    sectionAngles[item.id] = item.angle;
  });

  // Pivot and geometry based on orientation
  const isTop = orientation === 'top';
  // For top: pivot at bottom center, arc curves upward
  const pivot = isTop ? { x: 100, y: 95 } : { x: 0, y: 100 };
  const dotRadius = isTop ? 70 : 72;
  const labelOffset = isTop ? 18 : 22;

  // Spring physics animation
  const animateNeedle = useCallback(() => {
    const stiffness = 0.12;
    const damping = 0.82;

    const force = (targetRef.current - currentAngle) * stiffness;
    velocityRef.current = velocityRef.current * damping + force;
    const newAngle = currentAngle + velocityRef.current;
    
    setCurrentAngle(newAngle);

    if (rotatorRef.current) {
      const displayAngle = transformAngle(-newAngle);
      rotatorRef.current.setAttribute('transform', `rotate(${displayAngle})`);
      
      // Motion blur effect
      if (Math.abs(velocityRef.current) > 0.8) {
        rotatorRef.current.classList.add('motion-blur');
      } else {
        rotatorRef.current.classList.remove('motion-blur');
      }
    }

    animationFrameRef.current = requestAnimationFrame(animateNeedle);
  }, [currentAngle, transformAngle]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateNeedle);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateNeedle]);

  // Update needle target when active section changes
  useEffect(() => {
    if (sectionAngles[activeSection] !== undefined) {
      targetRef.current = sectionAngles[activeSection];
    }
  }, [activeSection, sectionAngles]);

  const handleClick = (item: NavItem) => {
    targetRef.current = item.angle;
    onNavigate(item.id);
  };

  const calculatePosition = (angle: number) => {
    if (isTop) {
      // For top orientation: arc curves upward from pivot at bottom
      // Map original angles (60 to -60) to positions on top semicircle (180° to 0°)
      // angle 60 -> 120° (upper left), angle 0 -> 90° (top), angle -60 -> 60° (upper right)
      const mappedAngle = 90 + angle; // 60->150, 30->120, 0->90, -30->60, -60->30
      const rad = mappedAngle * Math.PI / 180;
      const cx = pivot.x + Math.cos(rad) * dotRadius;
      const cy = pivot.y - Math.sin(rad) * dotRadius;
      const tx = pivot.x + Math.cos(rad) * (dotRadius + labelOffset);
      const ty = pivot.y - Math.sin(rad) * (dotRadius + labelOffset);
      return { cx, cy, tx, ty };
    }
    // Right orientation: original behavior
    const rad = (-angle) * Math.PI / 180;
    const cx = pivot.x + Math.cos(rad) * dotRadius;
    const cy = pivot.y + Math.sin(rad) * dotRadius;
    const tx = pivot.x + Math.cos(rad) * (dotRadius + labelOffset);
    const ty = pivot.y + Math.sin(rad) * (dotRadius + labelOffset);
    return { cx, cy, tx, ty };
  };

  // Generate arc paths based on orientation
  const getArcPaths = () => {
    if (isTop) {
      // Top semicircle - arc curves upward, pivot at y=95
      return {
        outer: "M 25,95 A 75 75 0 0 1 175,95",
        middle: "M 35,95 A 65 65 0 0 1 165,95",
        inner: "M 15,95 A 85 85 0 0 1 185,95"
      };
    }
    // Right semicircle (90° to -90°) - original
    return {
      outer: "M 0,20 A 80 80 0 0 1 0,180",
      middle: "M 0,32 A 68 68 0 0 1 0,168",
      inner: "M 0,10 A 90 90 0 0 1 0,190"
    };
  };

  const arcPaths = getArcPaths();

  // Get text anchor based on orientation and position
  const getTextAnchor = (angle: number) => {
    if (isTop) {
      return "middle";
    }
    return "start";
  };

  const getTextDominantBaseline = (angle: number) => {
    if (isTop) {
      return "auto";
    }
    return "middle";
  };

  return (
    <div className={`w-full h-full flex items-center ${isTop ? 'justify-center' : 'justify-center md:justify-start'}`}>
      <div className={isTop 
        ? "w-full max-w-[400px] h-[130px]" 
        : "w-[280px] sm:w-[320px] md:w-[360px] lg:w-[400px] max-w-full"
      }>
        <svg 
          viewBox={isTop ? "0 -5 200 105" : "0 0 200 200"}
          preserveAspectRatio="xMidYMid meet" 
          className="w-full h-auto compass-shadow"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arc backgrounds */}
          <path 
            d={arcPaths.outer}
            fill="none" 
            className="stroke-compass-arc" 
            strokeWidth="2.2" 
          />
          <path 
            d={arcPaths.middle}
            fill="none" 
            className="stroke-compass-arc-inner" 
            strokeWidth="1.2" 
          />
          <path 
            d={arcPaths.inner}
            fill="none" 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth="0.8" 
            strokeDasharray="2,3" 
          />

          {/* Navigation items */}
          {items.map((item) => {
            const { cx, cy, tx, ty } = calculatePosition(item.angle);
            const isActive = activeSection === item.id;
            
            return (
              <g 
                key={item.id}
                className="cursor-pointer group"
                onClick={() => handleClick(item)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  handleClick(item);
                }}
                style={{ touchAction: 'manipulation' }}
              >
                {/* Invisible touch target for better tapping */}
                <circle
                  cx={tx}
                  cy={ty}
                  r={24}
                  fill="transparent"
                />
                
                {/* Connector line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={tx}
                  y2={ty}
                  stroke={isActive ? "hsl(var(--compass-glow))" : "hsl(var(--compass-arc))"}
                  strokeWidth="0.6"
                  opacity="0.7"
                  className={isActive ? 'pulse-line' : ''}
                />
                
                {/* Label */}
                <text
                  x={tx}
                  y={ty}
                  className={`text-[11px] sm:text-[12px] transition-all duration-200 select-none ${
                    isActive 
                      ? 'fill-compass-label-active' 
                      : 'fill-compass-label group-hover:fill-primary'
                  }`}
                  dominantBaseline={getTextDominantBaseline(item.angle)}
                  textAnchor={getTextAnchor(item.angle)}
                >
                  {item.label}
                </text>
                
                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 3.2 : 2}
                  className={`transition-all duration-300 ${
                    isActive ? 'fill-compass-glow' : 'fill-compass-dot'
                  }`}
                  filter={isActive ? 'url(#glow)' : undefined}
                />
              </g>
            );
          })}

          {/* Needle system */}
          <g transform={`translate(${pivot.x} ${pivot.y})`}>
            <g ref={rotatorRef} transform={`rotate(${transformAngle(-currentAngle)})`}>
              <polygon 
                points="0,0 12,-3 64,0 12,3" 
                className="fill-compass-glow" 
                filter="url(#glow)" 
              />
              <circle cx="0" cy="0" r="4" className="fill-compass-glow" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CompassNav;
