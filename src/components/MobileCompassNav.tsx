import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  const isDraggingRef = useRef(false);
  const dragStartedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const [currentAngle, setCurrentAngle] = useState(60);
  const velocityRef = useRef(0);
  const targetRef = useRef(60);
  const animationFrameRef = useRef<number>();

  /* ============ Geometry Constants ============ */

  const pivot = { x: 100, y: 5 };
  const dotRadius = 64;
  const labelOffset = 40;
  const lineGap = 14;
  const DRAG_THRESHOLD = 5; // pixels before considering it a drag

  const transformAngle = useCallback((angle: number) => angle + 90, []);

  /* ============ Spring Animation ============ */

  const animateNeedle = useCallback(() => {
    if (isDraggingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateNeedle);
      return;
    }

    const stiffness = 0.12;
    const damping = 0.82;

    const force = (targetRef.current - currentAngle) * stiffness;
    velocityRef.current = velocityRef.current * damping + force;
    const next = currentAngle + velocityRef.current;

    setCurrentAngle(next);

    if (rotatorRef.current) {
      rotatorRef.current.setAttribute(
        'transform',
        `rotate(${transformAngle(-next)})`
      );
    }

    animationFrameRef.current = requestAnimationFrame(animateNeedle);
  }, [currentAngle, transformAngle]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateNeedle);
    return () =>
      animationFrameRef.current &&
      cancelAnimationFrame(animationFrameRef.current);
  }, [animateNeedle]);

  useEffect(() => {
    const activeItem = items.find(i => i.id === activeSection);
    if (activeItem) {
      targetRef.current = activeItem.angle;
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

  const snapToNearest = () => {
    const closest = items.reduce((prev, curr) =>
      Math.abs(curr.angle - currentAngle) < Math.abs(prev.angle - currentAngle)
        ? curr
        : prev
    );
    targetRef.current = closest.angle;
    onNavigate(closest.id);
  };

  /* ============ Pointer Event Handlers ============ */

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only start drag tracking on background/needle area
    const target = e.target as SVGElement;
    const isLabelOrDot = target.closest('[data-nav-item]');
    
    if (isLabelOrDot) {
      // Don't start drag for label/dot clicks
      return;
    }

    startPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartedRef.current = false;
    isDraggingRef.current = false;
    svgRef.current?.setPointerCapture(e.pointerId);
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current?.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only start dragging after threshold
    if (!dragStartedRef.current && distance > DRAG_THRESHOLD) {
      dragStartedRef.current = true;
      isDraggingRef.current = true;
    }

    if (!isDraggingRef.current) return;

    const angle = getAngleFromEvent(e.clientX, e.clientY);
    if (angle === null) return;

    const mapped = 90 - angle;
    setCurrentAngle(mapped);
    targetRef.current = mapped;
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current?.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStartedRef.current = false;
      snapToNearest();
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current?.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStartedRef.current = false;
      snapToNearest();
    }
  };

  /* ============ Section Click Handler ============ */

  const handleSectionClick = (sectionId: string) => {
    // Prevent click if we were dragging
    if (dragStartedRef.current) {
      return;
    }

    const section = items.find(i => i.id === sectionId);
    if (section) {
      targetRef.current = section.angle;
      onNavigate(sectionId);
    }
  };

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
          style={{
            touchAction: 'none',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {/* Navigation Items (Sections) */}
          {items.map(item => {
            const { cx, cy, tx, ty, lx, ly } = calculatePosition(item.angle);
            const active = isItemActive(item.id);

            return (
              <g
                key={item.id}
                data-nav-item={item.id}
                onClick={() => handleSectionClick(item.id)}
                className="cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Invisible touch target for better mobile tapping */}
                <circle
                  cx={tx}
                  cy={ty}
                  r={24}
                  fill="transparent"
                />

                {/* Connector Line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={lx}
                  y2={ly}
                  stroke="hsl(var(--compass-arc))"
                  strokeWidth={active ? '1.2' : '0.6'}
                  opacity={active ? '1' : '0.7'}
                  className="transition-all duration-300"
                />

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 3.5 : 2.5}
                  className={`transition-all duration-300 ${
                    active ? 'fill-compass-dot-active' : 'fill-compass-dot'
                  }`}
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
                className="fill-compass-glow drop-shadow-md transition-all duration-150"
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
            pointerEvents="none"
          />
        </svg>
      </div>
    </nav>
  );
};

export default MobileCompassNav;
