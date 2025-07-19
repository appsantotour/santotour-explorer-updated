
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TitleBar from './components/layout/TitleBar';
import ClientForm from './components/forms/ClientesForm';
import ViagensPage from './pages/ViagensPage'; // Changed ViagensForm to ViagensPage
import FornecedoresForm from './components/forms/FornecedoresForm';
import LocaisEmbarquePage from './pages/LocaisEmbarquePage';
import PassageirosForm from './components/forms/PassageirosForm';
import UsuariosForm from './components/admin/UsuariosForm'; // Import UsuariosForm
import { UserProvider, useUser } from './hooks/use-user.tsx'; // Explicitly import .tsx
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import ReportsPage from './pages/ReportsPage';
import ClientReport from './components/reports/ClientReport';
import ViagensReport from "./components/reports/ViagensReport";
import PassageirosReport from "./components/reports/PassageirosReport";
import AdiantamentosReport from "./components/reports/AdiantamentosReport";
import PagamentosReport from "./components/reports/PagamentosReport";
import IndicadoresReport from "./components/reports/IndicadoresReport"; // Usado para "Relatório de Indicações" (detalhado)
import IndicacoesReport from "./components/reports/IndicacoesReport"; // Usado para "Relatório Geral de Indicações" (consolidado)
import { ListaEmbarque } from "./components/reports/ListaEmbarque";
import GerenciamentoPoltronas from "./components/reports/GerenciamentoPoltronas"; // Renamed from PassengerSeatList
import FornecedoresReport from "./components/reports/FornecedoresReport"; // Added FornecedoresReport
import VoucherGenerator from "./components/reports/VoucherGenerator"; // Added VoucherGenerator
import LocaisEmbarqueReport from "./components/reports/LocaisEmbarqueReport";
// import { isSupabaseConfigured } from "./components/auth/supabaseClient";
import CpfSearchModal from './components/CpfSearchModal';
import AnimatedLogo from './components/ui/animated-logo';
import NotFoundPage from './pages/NotFoundPage';

type FormType =
  | 'clientes'
  | 'viagens'
  | 'fornecedores'
  | 'locaisEmbarque'
  | 'passageiros'
  | 'usuarios'
  | 'dashboard'
  | 'reports'
  | 'reportClientes'
  | 'reportViagens'
  | 'reportPassageiros'
  | 'reportListaEmbarque'
  | 'reportAdiantamentos'
  | 'reportPagamentos'
  | 'reportIndicacoes' // Detalhado (IndicadoresReport)
  | 'reportIndicacoesGeral' // Consolidado (IndicacoesReport)
  | 'reportPassengerSeatList' // Route key remains, component changes
  | 'reportFornecedores' // Added for FornecedoresReport
  | 'reportVoucherGenerator' // Added for VoucherGenerator
  | 'reportLocaisEmbarque' // Added reportLocaisEmbarque
  | 'logout';

const formConfigurations: Record<
  Exclude<FormType, 'login' | 'pedido-acesso'>, // Exclude login and pedido-acesso as they don't need general config
  { title: string; subtitle: string; Component: React.FC<any>; } | { action: 'logout' }
> = {
  dashboard: { title: 'Dashboard Principal', subtitle: 'Visão geral e navegação rápida.', Component: Dashboard },
  clientes: { title: 'Cadastro de Clientes', subtitle: 'Gerencie informações dos seus clientes.', Component: ClientForm },
  viagens: { title: 'Cadastro de Viagens', subtitle: 'Planeje os detalhes das suas viagens.', Component: ViagensPage },
  passageiros: { title: 'Cadastro de Passageiros', subtitle: 'Gerencie passageiros em suas viagens.', Component: PassageirosForm },
  locaisEmbarque: { title: 'Locais de Embarque', subtitle: 'Gerencie os embarques para suas viagens.', Component: LocaisEmbarquePage },
  fornecedores: { title: 'Cadastro de Fornecedores', subtitle: 'Gerencie seus parceiros e fornecedores.', Component: FornecedoresForm },
  usuarios: { title: 'Gerenciamento de Usuários', subtitle: 'Administre usuários e permissões do sistema.', Component: UsuariosForm },
  reports: { title: 'Central de Relatórios', subtitle: 'Acesse todos os relatórios do sistema.', Component: ReportsPage },
  reportClientes: { title: "Relatório de Clientes", subtitle: "Lista detalhada dos clientes.", Component: ClientReport },
  reportViagens: { title: "Relatório de Viagens", subtitle: "Análise de resultados financeiros por viagem.", Component: ViagensReport },
  reportPassageiros: { title: "Relatório de Passageiros", subtitle: "Informações e status de pagamento dos passageiros.", Component: PassageirosReport },
  reportListaEmbarque: { title: "Lista de Embarque por Viagem", subtitle: "Organize e visualize passageiros por local de embarque e horários.", Component: ListaEmbarque },
  reportPassengerSeatList: { title: "Distribuição dePoltronas", subtitle: "Atribua poltronas a passageiros por viagem.", Component: GerenciamentoPoltronas },
  reportAdiantamentos: { title: "Relatório de Adiantamentos", subtitle: "Lista dos adiantamentos a fornecedores realizados.", Component: AdiantamentosReport },
  reportPagamentos: { title: "Relatório de Pagamentos", subtitle: "Detalhes de todos os pagamentos de passageiros.", Component: PagamentosReport },
  reportIndicacoes: { title: "Relatório de Indicadores", subtitle: "Detalhes das comissões aos Indicadores decada viagem.", Component: IndicadoresReport },
  reportIndicacoesGeral: { title: "Relatório Geral de Indicações", subtitle: "Visão completa de todos os indicadores e suas comissões.", Component: IndicacoesReport },
  reportFornecedores: { title: "Relatório de Fornecedores", subtitle: "Lista de fornecedores e seus serviços.", Component: FornecedoresReport },
  reportVoucherGenerator: { title: "Gerador de Vouchers", subtitle: "Emissão de vouchers personalizados das viagens.", Component: VoucherGenerator },
  reportLocaisEmbarque: { title: "Relatório de Locais de Embarque", subtitle: "Veja todos os locais de embarque cadastrados.", Component: LocaisEmbarqueReport },
  logout: { action: 'logout' },
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, logout } = useUser(); // user and session removed, as auth is bypassed
  const [currentForm, setCurrentForm] = useState<FormType | null>(null);
  const [isCpfSearchModalOpen, setIsCpfSearchModalOpen] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;

    if (isLoading) return; // Wait until loading is complete

    if (currentPath === '/') {
      navigate('/dashboard', { replace: true });
    } else {
      const pathSegment = currentPath.substring(1) as FormType;
      if (formConfigurations[pathSegment]) {
        setCurrentForm(pathSegment);
      } else {
        // Set currentForm to null to show 404 page
        setCurrentForm(null);
      }
    }
  }, [isLoading, navigate, location]);

  const handleNavigate = (formName: FormType | string) => {
    const formConfigKey = formName as Exclude<FormType, 'login' | 'pedido-acesso'>;
    const actionOrConfig = formConfigurations[formConfigKey];
    
    if (actionOrConfig && 'action' in actionOrConfig && actionOrConfig.action === 'logout') {
      logout().then(() => {
        setCurrentForm(null);
        navigate('/login'); 
      });
    } else if (actionOrConfig && 'Component' in actionOrConfig) { // Check if Component exists
      setCurrentForm(formName as FormType);
      navigate(`/${formName}`);
    } else if (formName.startsWith('reports/')) {
        const reportType = formName.split('/')[1];
        if (reportType === 'client-list') {
            setCurrentForm('reportClientes'); navigate('/reportClientes');
        } else if (reportType === 'trip-summary') {
            setCurrentForm('reportViagens'); navigate('/reportViagens');
        } else if (reportType === 'passenger-data') {
            setCurrentForm('reportPassageiros'); navigate('/reportPassageiros');
        } else if (reportType === 'boarding-list') {
            setCurrentForm('reportListaEmbarque'); navigate('/reportListaEmbarque');
        } else if (reportType === 'passenger-seat-list') {
            setCurrentForm('reportPassengerSeatList'); navigate('/reportPassengerSeatList');
        } else if (reportType === 'advances-summary') {
            setCurrentForm('reportAdiantamentos'); navigate('/reportAdiantamentos');
        } else if (reportType === 'payment-list') {
            setCurrentForm('reportPagamentos'); navigate('/reportPagamentos');
        } else if (reportType === 'referrals-detailed') {
            setCurrentForm('reportIndicacoes'); navigate('/reportIndicacoes');
        } else if (reportType === 'referral-overview') {
            setCurrentForm('reportIndicacoesGeral'); navigate('/reportIndicacoesGeral');
        } else if (reportType === 'supplier-list') { 
            setCurrentForm('reportFornecedores'); navigate('/reportFornecedores');
        } else if (reportType === 'voucher-generator') { 
            setCurrentForm('reportVoucherGenerator'); navigate('/reportVoucherGenerator');
        } else if (reportType === 'locais-embarque') {
            setCurrentForm('reportLocaisEmbarque'); navigate('/reportLocaisEmbarque');
        } else {
            console.warn(`Report type "${reportType}" not handled, navigating to main reports page.`);
            setCurrentForm('reports'); navigate('/reports');
        }
    } else {
      console.warn(`Navigation to "${formName}" is not defined in formConfigurations or is a special path not handled by this function.`);
    }
  };

  const handleToggleCpfSearchModal = () => {
    setIsCpfSearchModalOpen(!isCpfSearchModalOpen);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-navy to-blue-800">
        <AnimatedLogo className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56" />
        <p className="text-white text-xl mt-4 font-semibold">Carregando aplicação...</p>
      </div>
    );
  }
  
  const publicPaths: string[] = [];
  
  const currentFormConfig = currentForm ? formConfigurations[currentForm] : null;

  let titleBarConfig = { title: 'Santo Tour Viagens', subtitle: 'Bem-vindo ao sistema de gerenciamento.' };

  if (currentFormConfig) {
    if ('Component' in currentFormConfig) {
      titleBarConfig = { title: currentFormConfig.title, subtitle: currentFormConfig.subtitle };
    }
  }
  
  const is404Page = !location.pathname.split('/').some(segment => Object.keys(formConfigurations).includes(segment));
  const showNavAndFooter = !publicPaths.includes(location.pathname);
  const showTitleBar = showNavAndFooter && !is404Page;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {showNavAndFooter && <Navbar onNavigate={handleNavigate} onToggleCpfSearchModal={handleToggleCpfSearchModal} />}
      <main className={`flex-grow ${showNavAndFooter ? 'pt-20 pb-6' : ''}`}>
        <div className={`${showNavAndFooter ? 'container mx-auto px-4' : ''}`}>
          {showTitleBar && <TitleBar title={titleBarConfig.title} subtitle={titleBarConfig.subtitle} />}
          <div key={currentForm ?? location.pathname} className={`${showNavAndFooter ? 'mt-1 bg-white p-0 rounded-xl' : ''}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {Object.entries(formConfigurations).map(([path, config]) => {
                if ('Component' in config) {
                  return <Route key={path} path={`/${path}`} element={<config.Component onNavigate={handleNavigate} />} />;
                }
                return null;
              })}
              <Route path="*" element={<NotFoundPage onNavigate={handleNavigate} />} />
            </Routes>
          </div>
        </div>
      </main>
      {showNavAndFooter && <Footer />}
      {showNavAndFooter && <CpfSearchModal isOpen={isCpfSearchModalOpen} onClose={handleToggleCpfSearchModal} />}
      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider> 
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;