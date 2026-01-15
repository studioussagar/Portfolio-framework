import React, { useEffect, useRef, useCallback } from 'react';

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

const MobileCompassNav: React.FC<MobileCompassNavProps> = ({
  items,
  activeSection,
  onNavigate,
}) => {
  const rotatorRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Use refs for all mutable state to avoid stale closures
  const isDraggingRef = useRef(false);
  const currentAngleRef = useRef(60);
  const velocityRef = useRef(0);
  const targetAngleRef = useRef(60);
  const animationFrameRef = useRef<number>();
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  /* ============ Geometry Constants ============ */
  const pivot = { x: 100, y: 5 };
  const dotRadius = 64;
  const labelOffset = 40;
  const lineGap = 14;
  const DRAG_THRESHOLD = 5;

  const transformAngle = (angle: number) => angle + 90;

  /* ============ Navigation Helper ============ */
  const navigateToSection = useCallback((sectionId: string) => {
    const section = items.find(i => i.id === sectionId);
    if (section) {
      targetAngleRef.current = section.angle;
      onNavigate(sectionId);
    }
  }, [items, onNavigate]);

  const snapToNearest = useCallback(() => {
    const currentAngle = currentAngleRef.current;
    let closest = items[0];
    let minDiff = Math.abs(items[0].angle - currentAngle);
    
    for (const item of items) {
      const diff = Math.abs(item.angle - currentAngle);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    
    targetAngleRef.current = closest.angle;
    onNavigate(closest.id);
  }, [items, onNavigate]);

  /* ============ Spring Animation ============ */
  useEffect(() => {
    const animate = () => {
      const stiffness = 0.12;
      const damping = 0.82;

      if (!isDraggingRef.current) {
        const force = (targetAngleRef.current - currentAngleRef.current) * stiffness;
        velocityRef.current = velocityRef.current * damping + force;
        currentAngleRef.current += velocityRef.current;
      }

      if (rotatorRef.current) {
        rotatorRef.current.setAttribute(
          'transform',
          `rotate(${transformAngle(-currentAngleRef.current)})`
        );
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update target angle when active section changes (from scroll)
  useEffect(() => {
    const activeItem = items.find(i => i.id === activeSection);
    if (activeItem && !isDraggingRef.current) {
      targetAngleRef.current = activeItem.angle;
    }
  }, [activeSection, items]);

  /* ============ Drag Math ============ */
  const getAngleFromEvent = (clientX: number, clientY: number): number | null => {
    if (!svgRef.current) return null;

    const rect = svgRef.current.getBoundingClientRect();
    const svgWidth = 240;
    const svgHeight = 140;

    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;

    const offsetX = 20;
    const offsetY = 10;

    const x = (clientX - rect.left) * scaleX - offsetX;
    const y = (clientY - rect.top) * scaleY - offsetY;

    const dx = x - pivot.x;
    const dy = y - pivot.y;

    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  /* ============ Touch/Pointer Event Handlers ============ */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasDraggedRef.current = false;
    velocityRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - startPosRef.current.x;
    const dy = touch.clientY - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!hasDraggedRef.current && distance > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      isDraggingRef.current = true;
    }

    if (!isDraggingRef.current) return;

    e.preventDefault();

    const angle = getAngleFromEvent(touch.clientX, touch.clientY);
    if (angle === null) return;

    const mapped = 90 - angle;
    const clamped = Math.max(-70, Math.min(70, mapped));
    currentAngleRef.current = clamped;
    targetAngleRef.current = clamped;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      snapToNearest();
    }
    hasDraggedRef.current = false;
  }, [snapToNearest]);

  /* ============ Label Click Handler ============ */
  const handleLabelClick = useCallback((e: React.MouseEvent | React.TouchEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't navigate if we just finished dragging
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    
    navigateToSection(sectionId);
  }, [navigateToSection]);

  /* ============ Geometry ============ */
  const calculatePosition = (angle: number) => {
    const rad = (90 - angle) * (Math.PI / 180);

    const cx = pivot.x + Math.cos(rad) * dotRadius;
    const cy = pivot.y + Math.sin(rad) * dotRadius;

    const tx = pivot.x + Math.cos(rad) * (dotRadius + labelOffset);
    const ty = pivot.y + Math.sin(rad) * (dotRadius + labelOffset);

    const lx = pivot.x + Math.cos(rad) * (dotRadius + labelOffset - lineGap);
    const ly = pivot.y + Math.sin(rad) * (dotRadius + labelOffset - lineGap);

    return { cx, cy, tx, ty, lx, ly };
  };

  const isItemActive = (itemId: string) => itemId === activeSection;

  /* ============ Render ============ */
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 md:hidden safe-area-top glass-panel border-b border-border/20">
      <div className="w-full flex items-center justify-center pt-2 pb-4">
        <svg
          ref={svgRef}
          viewBox="-20 -10 240 140"
          className="w-full max-w-[400px] h-auto"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <filter id="mobile-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Navigation Items (Sections) */}
          {items.map(item => {
            const { cx, cy, tx, ty, lx, ly } = calculatePosition(item.angle);
            const active = isItemActive(item.id);

            return (
              <g
                key={item.id}
                className="cursor-pointer"
                onClick={(e) => handleLabelClick(e, item.id)}
                onTouchEnd={(e) => {
                  if (!hasDraggedRef.current) {
                    handleLabelClick(e, item.id);
                  }
                }}
              >
                {/* Invisible touch target for better mobile tapping */}
                <circle
                  cx={tx}
                  cy={ty}
                  r={30}
                  fill="transparent"
                  style={{ pointerEvents: 'auto' }}
                />

                {/* Connector Line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={lx}
                  y2={ly}
                  stroke={active ? "hsl(var(--compass-glow))" : "hsl(var(--compass-arc))"}
                  strokeWidth={active ? '1.2' : '0.6'}
                  opacity={active ? '1' : '0.7'}
                  className="transition-all duration-300"
                  style={{ pointerEvents: 'none' }}
                />

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 3.5 : 2.5}
                  className={`transition-all duration-300 ${
                    active ? 'fill-compass-dot-active' : 'fill-compass-dot'
                  }`}
                  filter={active ? 'url(#mobile-glow)' : undefined}
                  style={{ pointerEvents: 'none' }}
                />

                {/* Label */}
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`transition-all duration-300 select-none ${
                    active
                      ? 'text-[12px] sm:text-[13px] font-semibold fill-compass-label-active'
                      : 'text-[11px] sm:text-[12px] fill-compass-label'
                  }`}
                  style={{ pointerEvents: 'none' }}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Needle / Rotator */}
          <g transform={`translate(${pivot.x} ${pivot.y})`}>
            <g
              ref={rotatorRef}
              style={{ pointerEvents: 'none' }}
            >
              {/* Needle glow / highlight */}
              <polygon
                points="0,0 12,-3 64,0 12,3"
                className="fill-compass-glow drop-shadow-md"
                filter="url(#mobile-glow)"
              />

              {/* Needle pivot center */}
              <circle cx="0" cy="0" r="4" className="fill-compass-glow" />
            </g>
          </g>

          {/* Decorative circle around pivot */}
          <circle
            cx={pivot.x}
            cy={pivot.y}
            r="8"
            fill="none"
            stroke="hsl(var(--compass-arc))"
            strokeWidth="0.5"
            opacity="0.3"
            style={{ pointerEvents: 'none' }}
          />
        </svg>
      </div>
    </nav>
  );
};

export default MobileCompassNav;
