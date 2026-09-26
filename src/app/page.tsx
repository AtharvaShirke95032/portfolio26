"use client";

import { DesktopProvider } from "@/components/desktop";
import Dock from "@/components/Dock";
import Hero from "@/components/Hero";
import MenuBar from "@/components/MenuBar";
import { About, Contact, Experience, Projects, Skills } from "@/components/Sections";

export default function Home() {
  return (
    <DesktopProvider>
      <MenuBar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Dock />
    </DesktopProvider>
  );
}
