
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { applyCpfMask } from '../utils/maskUtils';
import { X, Search, Info, Loader2 } from 'lucide-react';

interface ClientInfo {
  id: string;
  nome: string;
  cpf: string;
}

interface CpfSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CpfSearchModal: React.FC<CpfSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async () => {
    // Remove Supabase configuration check since it's always configured
    if (searchTerm.trim().length < 3) {
      setResults([]);
      setHasSearched(false); // Reset if search term is too short
      if (searchTerm.trim().length > 0) {
         toast({ title: "Termo Curto", description: "Digite ao menos 3 caracteres para buscar.", variant: "warning" });
      }
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, cpf')
        .ilike('nome', `%${searchTerm.trim()}%`) // Case-insensitive search
        .limit(10); // Limit results for performance

      if (error) {
        throw error;
      }
      setResults(data || []);
    } catch (error: any) {
      toast({ title: "Erro na Busca", description: error.message, variant: "destructive" });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]);

  // Debounce search
  useEffect(() => {
    if (searchTerm.trim().length === 0 && hasSearched) { // Clear results if search term is cleared after a search
        setResults([]);
        setHasSearched(false);
        return;
    }
    if (searchTerm.trim().length < 3) {
        setResults([]); // Clear results if below 3 chars, but don't reset hasSearched yet unless empty
        return;
    }

    const timerId = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timerId);
  }, [searchTerm, handleSearch, hasSearched]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4"
        aria-modal="true"
        role="dialog"
    >
      <div 
        ref={modalContentRef} 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Search size={22} className="mr-2 text-blue-600" />
            Consultar CPF por Nome
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome do cliente (mín. 3 letras)"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            aria-label="Nome do cliente para busca de CPF"
          />
           {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {hasSearched && !isLoading && results.length === 0 && (
            <div className="text-center py-4 px-2 bg-gray-50 rounded-md">
              <Info size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-600">Nenhum cliente encontrado com o termo "{searchTerm}".</p>
            </div>
          )}
          {results.map((client) => (
            <div
              key={client.id}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
            >
              <p className="font-medium text-gray-800">{client.nome}</p>
              <p className="text-sm text-blue-700 font-mono">{applyCpfMask(client.cpf)}</p>
            </div>
          ))}
        </div>
         {!hasSearched && !isLoading && searchTerm.length < 3 && (
            <div className="text-center py-4 px-2 bg-blue-50 border border-blue-200 rounded-md">
                <Info size={20} className="mx-auto text-blue-500 mb-1" />
                <p className="text-sm text-blue-700">Digite pelo menos 3 caracteres do nome para iniciar a busca.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CpfSearchModal;
