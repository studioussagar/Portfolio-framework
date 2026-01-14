import React, { useEffect, useRef, useState } from 'react';

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onVisible?: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({ id, title, children, onVisible }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            onVisible?.(id);
          }
        });
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [id, onVisible]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`min-h-screen flex items-center py-16 sm:py-20 md:py-24 px-6 sm:px-8 md:px-12 lg:px-24 section-fade ${
        isVisible ? 'visible' : ''
      }`}
    >
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.3rem] font-semibold mb-4 text-section-title tracking-tight">
          {title}
        </h1>
        <div className="text-base sm:text-lg text-section-text leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
};

export default Section;
