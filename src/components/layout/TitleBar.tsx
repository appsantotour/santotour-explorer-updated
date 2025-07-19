
import React from 'react';

interface TitleBarProps {
  title: string;
  subtitle: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, subtitle }) => {
  return (
    <div className="bg-blue-950 text-white py-6 px-4 shadow-lg container mx-auto"> {/* Outer div updated as per snippet */}
      {/* Inner div updated to handle centering */}
      <div className="flex flex-col justify-center h-full"> 
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-blue-100 mt-1 text-md">{subtitle}</p>
      </div>
    </div>
  );
};

export default TitleBar;
