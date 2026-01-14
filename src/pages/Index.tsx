import React, { useState, useCallback } from 'react';
import CompassNav from '@/components/CompassNav';
import MobileCompassNav from '@/components/MobileCompassNav';
import Section from '@/components/Section';

const navItems = [
  { id: 'profile', label: 'Profile', angle: 60 },
  { id: 'work', label: 'Work Experience', angle: 20 },
  { id: 'about', label: 'About', angle: -20 },
  { id: 'contact', label: 'Contact', angle: -60 },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const handleNavigate = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSectionVisible = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  return (
    <div className="ambient-bg min-h-screen">
      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-[360px_1fr] lg:grid-cols-[400px_1fr] min-h-screen">
        {/* Compass Panel - Fixed on desktop */}
        <aside className="sticky top-0 left-0 h-screen glass-panel border-r border-border/20 flex items-center justify-center z-10 relative">
          <CompassNav
            items={navItems}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />
        </aside>

        {/* Content */}
        <main className="relative overflow-hidden">
          <Section id="profile" title="Profile" onVisible={handleSectionVisible}>
            <p>
              A modern portfolio powered by a compass-driven navigation. 
              Scroll naturally or use the compass to jump between sections. 
              Built with precision and attention to detail.
            </p>
          </Section>

          <Section id="work" title="Work Experience" onVisible={handleSectionVisible}>
            <p>
              Showcase professional projects, internships, freelance work, 
              and impact with visual storytelling. Each project tells a 
              story of growth and innovation.
            </p>
          </Section>

          <Section id="about" title="About Me" onVisible={handleSectionVisible}>
            <p>
              Tell your story, your goals, your interests, and your design 
              philosophy in a clean readable layout. Connect with visitors 
              on a personal level.
            </p>
          </Section>

          <Section id="contact" title="Contact" onVisible={handleSectionVisible}>
            <p>
              Let visitors reach out easily using email, social links, or 
              a built-in contact form. Start meaningful conversations and 
              build lasting connections.
            </p>
          </Section>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden pb-20">
        {/* Mobile Header with mini compass */}
        <header className="sticky top-0 z-40 glass-panel border-b border-border/20 py-4 px-4">
          <div className="flex items-center justify-center">
            <div className="w-32 h-32">
              <CompassNav
                items={navItems}
                activeSection={activeSection}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="relative overflow-hidden">
          <Section id="profile" title="Profile" onVisible={handleSectionVisible}>
            <p>
              A modern portfolio powered by a compass-driven navigation. 
              Scroll naturally or use the compass to jump between sections.
            </p>
          </Section>

          <Section id="work" title="Work Experience" onVisible={handleSectionVisible}>
            <p>
              Showcase professional projects, internships, freelance work, 
              and impact with visual storytelling.
            </p>
          </Section>

          <Section id="about" title="About Me" onVisible={handleSectionVisible}>
            <p>
              Tell your story, your goals, your interests, and your design 
              philosophy in a clean readable layout.
            </p>
          </Section>

          <Section id="contact" title="Contact" onVisible={handleSectionVisible}>
            <p>
              Let visitors reach out easily using email, social links, or 
              a built-in contact form.
            </p>
          </Section>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileCompassNav
          items={navItems}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default Index;
