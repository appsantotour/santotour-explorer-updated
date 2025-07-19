import React from 'react';
import logoSrc from '../media/santo_tour_logo.png'; // Importa a imagem

interface AnimatedLogoProps {
  className?: string;
  delay?: number; // Example prop, not used in this placeholder
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <img 
        src={logoSrc} 
        alt="Santo Tour Logo" 
        className="logo-fade" // Mantém a animação de fade
        // O tamanho será controlado pela className passada, e.g., "h-32 w-auto"
        // Se className não especificar altura/largura, a imagem usará seu tamanho natural
        // ou você pode adicionar estilos padrão aqui se necessário.
      />
    </div>
  );
};

export default AnimatedLogo;