import React from 'react';

// ============================================================================
// Sub-components
// ============================================================================

interface TrafficConeProps {
  className?: string;
}

const TrafficCone: React.FC<TrafficConeProps> = ({ className }) => {
  return (
    <div className={`absolute flex flex-col items-center ${className}`}>
      <div className="w-full h-full bg-red-500 [clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)] relative">
        <div className="absolute top-[40%] -translate-y-1/2 left-0 w-full h-[20%] bg-white"></div>
      </div>
      <div className="w-[120%] h-2 bg-red-500 rounded-sm -mt-1"></div>
    </div>
  );
};

const PageNotFoundIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg h-64 mt-12 scale-90 sm:scale-100">
      {/* Error Tape */}
      <div className="absolute top-1/2 -translate-y-[80%] left-[-5%] w-[110%] h-16 bg-yellow-400 flex items-center justify-center gap-x-6 sm:gap-x-10 transform -rotate-2 shadow-lg z-10 overflow-hidden">
          <div className="flex items-center gap-x-6 sm:gap-x-10 animate-marquee whitespace-nowrap">
              <span className="text-2xl font-bold text-slate-800">ERRO</span>
              <span className="text-3xl font-bold text-slate-800">•</span>
              <span className="text-2xl font-bold text-slate-800">ERRO</span>
              <span className="text-3xl font-bold text-slate-800">•</span>
              <span className="text-2xl font-bold text-slate-800">ERRO</span>
              <span className="text-3xl font-bold text-slate-800">•</span>
              <span className="text-2xl font-bold text-slate-800">ERRO</span>
              <span className="text-3xl font-bold text-slate-800">•</span>
          </div>
          <style>
              {`
                  @keyframes marquee {
                      0% { transform: translateX(0%); }
                      100% { transform: translateX(-100%); }
                  }
                  .animate-marquee {
                      animation: marquee 10s linear infinite;
                      display: flex;
                      align-items: center;
                      gap: 2.5rem; /* same as gap-x-10 */
                      padding-right: 2.5rem;
                  }
              `}
          </style>
      </div>

      {/* Manhole */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 h-20 bg-slate-800 rounded-[50%] z-0 shadow-inner"></div>

      {/* Arm in Hole */}
      <div className="absolute bottom-4 left-1/2 -translate-x-[40%] w-24 h-40 z-20">
        <div className="absolute bottom-0 w-[60%] h-[80%] left-[20%] bg-blue-500 rounded-t-lg transform origin-bottom -rotate-12"></div>
        <div className="absolute top-0 left-0 w-20 h-20">
          <div className="absolute w-16 h-16 bg-orange-200 rounded-xl transform rotate-[30deg] top-4 left-0"></div>
          <div className="absolute w-6 h-12 bg-orange-200 rounded-t-full rounded-b-md transform -rotate-12 top-0 left-10 border-2 border-orange-300"></div>
        </div>
      </div>

      {/* Traffic Cones */}
      <TrafficCone className="bottom-2 left-[15%] w-20 h-24 z-30" />
      <TrafficCone className="bottom-2 right-[20%] w-16 h-20 z-30" />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="text-center">
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-red-500 tracking-wider">404</h1>
        <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mt-4">Desculpe, a página não foi encontrada</h2>
        <p className="text-md md:text-lg text-slate-600 mt-2 max-w-md mx-auto">
          O link que você seguiu provavelmente está quebrado ou a página foi removida.
        </p>
      </div>
      
      <PageNotFoundIllustration />

      <button 
        onClick={() => onNavigate('dashboard')}
        className="mt-16 sm:mt-20 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 z-30"
      >
        Voltar para a Página Inicial
      </button>
    </div>
  );
};

export default NotFoundPage;
