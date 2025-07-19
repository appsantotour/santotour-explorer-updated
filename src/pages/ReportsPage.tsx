
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Users,
  PlaneTakeoff,
  ClipboardList,
  ListOrdered,
  MapPin,
  CreditCard, 
  Receipt, 
  Award, // Added Award for IndicacoesReport
  PieChart, 
  Building,
  Shield,
  Construction,
  Ticket // Icon for VoucherGenerator
} from "lucide-react";
// import AnimatedLogo from '../components/ui/animated-logo';

// Define a specific type for report navigation actions
export type ReportNavigationAction =
  | 'reports/client-list'
  | 'reports/trip-summary'
  | 'reports/passenger-data'
  | 'reports/passenger-seat-list'
  | 'reports/boarding-list'
  | 'reports/advances-summary' 
  | 'reports/payment-list'
  | 'reports/referrals-detailed' // Action for IndicacoesReport
  | 'reports/referral-overview' // Kept, might be a different report
  | 'reports/referral-by-trip'  // Kept, might be a different report
  | 'reports/supplier-list'
  | 'reports/voucher-generator' // Action for VoucherGenerator
  | 'reports/admin-strategic-panel'
  | 'reports/under-development'
  | 'reports/locais-embarque'
  | string; 

export interface ReportsPageProps {
  onNavigate?: (path: ReportNavigationAction) => void;
}

const reportItems = [
  {
    title: "Relatório de Clientes",
    description: "Lista de todos os clientes cadastrados",
    icon: <Users className="h-6 w-6 text-blue-950" />, 
    action: 'reports/client-list',
  },
  {
    title: "Relatório de Viagens",
    description: "Dados úteis sobre as viagens e resultados financeiros",
    icon: <PlaneTakeoff className="h-6 w-6 text-blue-950" />, 
    action: 'reports/trip-summary',
  },
  { 
    title: "Relatório de Adiantamentos",
    description: "Consolidado de despesas, adiantamentos e saldos a pagar por viagem.",
    icon: <CreditCard className="h-6 w-6 text-blue-950" />, 
    action: 'reports/advances-summary',
  },
  {
    title: "Relatório de Passageiros",
    description: "Lista de passageiros e status de pagamento",
    icon: <ClipboardList className="h-6 w-6 text-blue-950" />, 
    action: 'reports/passenger-data',
  },
  { 
    title: "Relatório de Pagamentos",
    description: "Detalhes de todos os pagamentos de passageiros com filtros.",
    icon: <Receipt className="h-6 w-6 text-blue-950" />, 
    action: 'reports/payment-list',
  },
  {
    title: "Lista de Locais de Embarque",
    description: "Todos os locais de embarque cadastrados",
    icon: <MapPin className="h-6 w-6 text-green-700" />, 
    action: 'reports/locais-embarque',
  },
  {
    title: "Embarques Por Viagem",
    description: "Passageiros organizados por local de embarque",
    icon: <MapPin className="h-6 w-6 text-blue-950" />, 
    action: 'reports/boarding-list',
  },
  {
    title: "Distribuição de Poltronas",
    description: "Lista organizada de passageiros por poltrona para impressão",
    icon: <ListOrdered className="h-6 w-6 text-blue-950" />, 
    action: 'reports/passenger-seat-list', 
  },
  {
    title: "Gerar Vouchers PDF",
    description: "Crie e personalize vouchers para passageiros.",
    icon: <Ticket className="h-6 w-6 text-blue-950" />,
    action: 'reports/voucher-generator',
  },
  {
    title: "Relatório de Indicadores",
    description: "Detalhes dos indicadores e comissões geradas.",
    icon: <Award className="h-6 w-6 text-blue-950" />, 
    action: 'reports/referrals-detailed',
  },
  {
    title: "Relatório Geral de Indicações",
    description: "Visão completa de todos as indicações e suas comissões",
    icon: <PieChart className="h-6 w-6 text-blue-950" />, 
    action: 'reports/referral-overview', 
  },
  {
    title: "Lista de Fornecedores",
    description: "Fornecedores cadastrados e seus serviços",
    icon: <Building className="h-6 w-6 text-blue-950" />, 
    action: 'reports/supplier-list', 
  },
  {
    title: "Admin",
    description: "Gerencie aqui as informações estratégicas da agência",
    icon: <Shield className="h-6 w-6 text-blue-950" />, 
    action: 'reports/admin-strategic-panel', 
  },
  {
    title: "Em Desenvolvimento",
    description: "Novos relatórios serão adicionados sob demanda",
    icon: <Construction className="h-6 w-6 text-blue-950" />, 
    action: 'reports/under-development', 
  },
];

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const handleCardClick = (itemAction: ReportNavigationAction) => {
    if (onNavigate) {
      onNavigate(itemAction);
    } else {
      console.warn("onNavigate not provided to ReportsPage. Cannot navigate for action:", itemAction);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {reportItems.map((item) => (
          <ReportCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={() => handleCardClick(item.action)}
          />
        ))}
      </div>
    </div>
  );
};

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick }) => {
  let iconToRender: React.ReactNode = icon;

  if (React.isValidElement(icon)) {
    const elementToClone = icon as React.ReactElement<{ className?: string; [key: string]: any }>;
    
    iconToRender = React.cloneElement(
      elementToClone,
      {
        className: `${(icon.props as { className?: string }).className || ''} mr-3`.trim(),
      }
    );
  }

  return (
    <div onClick={onClick} className="block group cursor-pointer">
      <Card className="bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300 ease-in-out border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
          {iconToRender}
          <CardTitle className="text-base sm:text-md font-inter text-blue-950 group-hover:text-blue-700 transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-2 pb-3 sm:px-4 sm:pt-2 sm:pb-4 flex-grow">
          <p className="text-xs sm:text-sm text-gray-600 font-roboto">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;