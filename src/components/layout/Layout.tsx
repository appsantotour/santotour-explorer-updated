
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useUser } from "../../hooks/use-user";

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true, showFooter = true }) => {
  useUser(); // User data is not currently used in this component

  const handleMainNavigate = (formName: string) => {
    // A navegação será tratada pelo App.tsx através de props
    console.log("Layout: Navigate to", formName);
    
    // Buscar a função de navegação do App através do contexto ou props
    const event = new CustomEvent('navigate', { detail: formName });
    window.dispatchEvent(event);
  };

  // Adicionar listener para navegação
  React.useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      console.log('Navegação solicitada:', event.detail);
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar onNavigate={handleMainNavigate} />}
      <main className={`flex-grow ${showNavbar ? 'pt-16' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
