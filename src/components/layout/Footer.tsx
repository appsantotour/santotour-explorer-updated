

import React from 'react';
import { Copyright } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-950 text-white py-6 text-center shadow-inner-top"> {/* Temporarily bg-red-500 for debugging */}
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <Copyright size={16} className="text-white"/> {/* Ensure icon is visible on red */}
        <p className="text-sm">Santo Tour Viagens - 2025 - Internal use only</p>
      </div>
    </footer>
  );
};

export default Footer;