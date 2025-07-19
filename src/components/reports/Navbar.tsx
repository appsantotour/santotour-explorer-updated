
import React, { useState } from 'react';
import { LayoutDashboard, Users, LogOut, Plane, Building, MapPin, UsersRound, Menu, X, BarChart3 } from 'lucide-react'; // Added BarChart3 for Reports

interface NavbarProps {
  onNavigate: (formName: 'clientes' | 'viagens' | 'fornecedores' | 'locaisEmbarque' | 'passageiros' | 'usuarios' | 'dashboard' | 'reports' | 'logout' | string) => void; // Added 'reports' and string
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkClasses = "cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors";
  const mobileNavLinkClasses = "cursor-pointer flex items-center space-x-2 px-4 py-3 text-sm text-white hover:bg-blue-700 transition-colors w-full text-left";

  const handleMobileLinkClick = (formName: 'clientes' | 'viagens' | 'fornecedores' | 'locaisEmbarque' | 'passageiros' | 'usuarios' | 'dashboard' | 'reports' | 'logout' | string) => { // Added 'reports' and string
    onNavigate(formName);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-blue-950 text-white shadow-md fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full relative"> {/* Added relative for mobile menu positioning */}
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center h-full">
            <Plane size={28} className="mr-2 text-sky-400 logo-fade" />
            <span className="font-bold text-xl">Santo Tour Viagens</span>
          </div>
          
          {/* Itens centrais - Desktop */}
          <div className="hidden md:flex items-center space-x-1 h-full">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Dashboard"
            >
              <LayoutDashboard size={18} className="text-blue-300" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => onNavigate('reports')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Relatórios"
            >
              <BarChart3 size={18} className="text-blue-300" /> {/* Icon for Reports */}
              <span>Relatórios</span>
            </button>
            <button 
              onClick={() => onNavigate('clientes')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Clientes"
            >
              <Users size={18} className="text-blue-300" />
              <span>Clientes</span>
            </button>             
            <button 
              onClick={() => onNavigate('viagens')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Viagens"
            >
              <Plane size={18} className="text-blue-300" /> 
              <span>Viagens</span>
            </button>
            <button 
              onClick={() => onNavigate('passageiros')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Passageiros"
            >
              <UsersRound size={18} className="text-blue-300" /> 
              <span>Passageiros</span>
            </button>            
            <button 
              onClick={() => onNavigate('locaisEmbarque')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Locais de Embarque"
            >
              <MapPin size={18} className="text-blue-300" /> 
              <span>Locais Embarque</span>
            </button>
            <button 
              onClick={() => onNavigate('fornecedores')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Fornecedores"
            >
              <Building size={18} className="text-blue-300" /> 
              <span>Fornecedores</span>
            </button>
          </div>
          
          {/* Itens à direita - Desktop */}
          <div className="hidden md:flex items-center space-x-1 h-full">
            <button 
              onClick={() => onNavigate('logout')} 
              className={`${navLinkClasses} h-full flex items-center`}
              aria-label="Logout"
            >
              <LogOut size={18} className="text-blue-300" />
              <span>Logout</span>
            </button>
          </div>

          {/* Botão do menu mobile */}
          <div className="md:hidden flex items-center h-full">
            <button 
              onClick={toggleMobileMenu} 
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300 p-2" 
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-items"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Itens do menu mobile - Dropdown */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu-items" 
            className="md:hidden absolute top-16 left-0 right-0 bg-blue-950 shadow-xl py-2 z-40 border-t border-blue-800"
          >
            <button onClick={() => handleMobileLinkClick('dashboard')} className={mobileNavLinkClasses} aria-label="Dashboard">
              <LayoutDashboard size={18} className="text-blue-300" /><span>Dashboard</span>
            </button>
            <button onClick={() => handleMobileLinkClick('clientes')} className={mobileNavLinkClasses} aria-label="Clientes">
              <Users size={18} className="text-blue-300" /><span>Clientes</span>
            </button>
            <button onClick={() => handleMobileLinkClick('viagens')} className={mobileNavLinkClasses} aria-label="Viagens">
              <Plane size={18} className="text-blue-300" /><span>Viagens</span>
            </button>
            <button onClick={() => handleMobileLinkClick('passageiros')} className={mobileNavLinkClasses} aria-label="Passageiros">
              <UsersRound size={18} className="text-blue-300" /><span>Passageiros</span>
            </button>
            <button onClick={() => handleMobileLinkClick('locaisEmbarque')} className={mobileNavLinkClasses} aria-label="Locais de Embarque">
              <MapPin size={18} className="text-blue-300" /><span>Locais Embarque</span>
            </button>
            <button onClick={() => handleMobileLinkClick('fornecedores')} className={mobileNavLinkClasses} aria-label="Fornecedores">
              <Building size={18} className="text-blue-300" /><span>Fornecedores</span>
            </button>
            <button onClick={() => handleMobileLinkClick('reports')} className={mobileNavLinkClasses} aria-label="Relatórios">
              <BarChart3 size={18} className="text-blue-300" /><span>Relatórios</span>
            </button>            
            <div className="border-t border-blue-700 my-2 mx-4"></div>
            <button onClick={() => handleMobileLinkClick('logout')} className={mobileNavLinkClasses} aria-label="Logout">
              <LogOut size={18} className="text-blue-300" /><span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
