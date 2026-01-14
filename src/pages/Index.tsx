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
      <div className="md:hidden pb-32">

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

        {/* Mobile Bottom Compass Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/20">
          <div className="px-4 py-2">
            <CompassNav
              items={navItems}
              activeSection={activeSection}
              onNavigate={handleNavigate}
              orientation="top"
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;
