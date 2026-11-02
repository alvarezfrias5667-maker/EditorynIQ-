import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ currentPath, onNavigate, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FC]">
      <Header currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-1">{children}</main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
