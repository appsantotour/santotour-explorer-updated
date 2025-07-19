
import React from 'react';
// Layout and TitleBar imports removed
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// Link import might be unnecessary if onNavigate is always used
import {
  Users,
  Plane,
  MapPin,
  ClipboardList,
  Receipt,
  Shield,
  Store,
  BarChart3 // Added for consistency if reports has this icon
} from "lucide-react";
// import { useUser } from "../hooks/use-user";
import AnimatedLogo from '../components/ui/animated-logo';

type NavigationAction = 'clientes' | 'viagens' | 'passageiros' | 'adiantamentos' | 'gerenciar-passageiros' | 'locaisEmbarque' | 'reports' | 'fornecedores' | 'admin/paineladm' | 'usuarios' | string;

export interface DashboardProps { // Exported this interface
  onNavigate?: (path: NavigationAction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // const { user } = useUser();

  const dashboardItems = [
    {
      title: "Clientes",
      description: "Cadastro e gestão de clientes",
      icon: <Users className="h-6 w-6 text-blue-950" />, // Adjusted icon size slightly
      action: 'clientes',
    },
    {
      title: "Viagens",
      description: "Cadastro e gestão de viagens",
      icon: <Plane className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'viagens',
    },
    {
      title: "Passageiros",
      description: "Cadastro e gestão de passageiros",
      icon: <ClipboardList className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'passageiros',
    },
    {
      title: "Adiantamentos",
      description: "Cadastro e gestão de adiantamentos",
      icon: <Receipt className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'adiantamentos', // Placeholder, will need actual implementation
    },
    {
      title: "Gerenciar Passageiros",
      description: "Gerenciar passageiros por viagem",
      icon: <Users className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'gerenciar-passageiros', // Placeholder
    },
    {
      title: "Gerenciar Embarques",
      description: "Gerencie locais de embarque e horários",
      icon: <MapPin className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'locaisEmbarque',
    },
    {
      title: "Fornecedores",
      description: "Cadastro e gestão de fornecedores",
      icon: <Store className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'fornecedores',
    },
    {
      title: "Relatórios",
      description: "Visualização de relatórios",
      icon: <BarChart3 className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'reports', // Corrected action
    },
    {
      title: "Painel Administrativo",
      description: "Gerenciar acessos e logs do sistema",
      icon: <Shield className="h-6 w-6 text-blue-950" />, // Adjusted icon size
      action: 'usuarios', // Action for App.tsx navigation
      adminOnly: true,
    },
  ];

  const handleCardClick = (itemAction: NavigationAction) => {
    if (onNavigate) {
      onNavigate(itemAction);
    } else {
      console.warn("onNavigate not provided to Dashboard. Cannot navigate for action:", itemAction);
    }
  };

  return (
    // No Layout wrapper here. No explicit container div with mx-auto, App.tsx's <main> handles it.
    // No TitleBar component here, App.tsx handles it.
    <div>
      {/* Grid of Dashboard Cards. Removed mt-4, App.tsx handles spacing. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {dashboardItems.map((item) => {
          // const isAdmin = user?.roles?.includes('admin');
          // if (item.adminOnly && !isAdmin) {
          //   return null;
          // }
          return (
            <DashboardCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={() => handleCardClick(item.action as NavigationAction)}
            />
          );
        })}
      </div>

      {/* Animated Logo at the bottom. Changed mb-4 to consistent value, can be adjusted. */}
      <div className="flex justify-center mt-12 mb-4">
        <AnimatedLogo className="h-32 sm:h-40 md:h-48" delay={0.5} />
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  // link prop removed as navigation is handled by onClick
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, onClick }) => {
  let iconToRender: React.ReactNode = icon;

  if (React.isValidElement(icon)) {
    // Cast the icon to a type that React.cloneElement can work with for className.
    // This helps TypeScript understand that 'className' is a valid prop.
    const elementToClone = icon as React.ReactElement<{ className?: string; [key: string]: any }>;
    
    iconToRender = React.cloneElement(
      elementToClone,
      {
        // Access props from the original icon for reading existing className
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

export default Dashboard;
