
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
import { FornecedoresFormData } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { applyPhoneMask } from '../../utils/maskUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, FileDown, XCircle } from 'lucide-react';
import PrintableFornecedoresReport, { PrintFornecedorColumn } from './prints/PrintableFornecedoresReport';

// Define a more specific type for keys that are sortable in this report.
type SortableFornecedorKey = keyof ReportFornecedorData;

interface SortConfig {
  key: SortableFornecedorKey;
  direction: 'ascending' | 'descending';
}

// Interface for data specifically shaped for this report's display and internal logic
// Includes the original FornecedoresFormData plus any computed/formatted fields
interface ReportFornecedorData extends FornecedoresFormData {
  servicos_oferecidos_display: string; // Formatted string for display
  // Add other computed/formatted fields if necessary
}

const allPrintableColumnsConfig: Array<{ key: SortableFornecedorKey; label: string; defaultSelected: boolean }> = [
  { key: 'nome_fornecedor', label: 'Nome Fornecedor', defaultSelected: true },
  { key: 'nome_contato', label: 'Contato', defaultSelected: true },
  { key: 'whatsapp', label: 'WhatsApp', defaultSelected: true },
  { key: 'cidade', label: 'Cidade', defaultSelected: false },
  { key: 'estado', label: 'UF', defaultSelected: false },
  { key: 'servicos_oferecidos_display', label: 'Serviços Oferecidos', defaultSelected: true },
  { key: 'observacoes', label: 'Observações', defaultSelected: false },
  { key: 'ativo', label: 'Ativo', defaultSelected: false },
];

interface PrintColumnConfigItem {
  key: SortableFornecedorKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}

const FornecedoresReport: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<ReportFornecedorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'nome_fornecedor', direction: 'ascending' });
  const { toast } = useToast();

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printColumnConfig, setPrintColumnConfig] = useState<PrintColumnConfigItem[]>(
    allPrintableColumnsConfig.map(col => ({
      ...col,
      isSelected: col.defaultSelected,
      printOrder: '',
    }))
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [printableData, setPrintableData] = useState<{ columns: PrintFornecedorColumn[]; fornecedores: ReportFornecedorData[] } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  const getServicosOferecidos = (fornecedor: FornecedoresFormData): string => {
    const servicos: string[] = [];

    if (fornecedor.fretamento) {
      const tiposFretamento: string[] = [];
      if (fornecedor.onibus) tiposFretamento.push("Ônibus");
      if (fornecedor.semi_leito) tiposFretamento.push("Semi-Leito");
      if (fornecedor.microonibus) tiposFretamento.push("Micro-ônibus");
      if (fornecedor.van) tiposFretamento.push("Van");
      if (fornecedor.carro) tiposFretamento.push("Carro Executivo");
      
      if (tiposFretamento.length > 0) {
        servicos.push(`Fretamento (${tiposFretamento.join(', ')})`);
      } else {
        servicos.push("Fretamento (Tipo não especificado)");
      }
    }

    if (fornecedor.hospedagem) {
      if (fornecedor.tipohospedagem && fornecedor.tipohospedagem !== '') {
        servicos.push(`Hospedagem (${fornecedor.tipohospedagem})`);
      } else {
        servicos.push("Hospedagem (Tipo não especificado)");
      }
    }

    if (fornecedor.guias) servicos.push("Guias");
    if (fornecedor.passeios) servicos.push("Passeios");
    if (fornecedor.ingressos) servicos.push("Ingressos");
    if (fornecedor.estacionamentos) servicos.push("Estacionamentos");
    if (fornecedor.brindes) servicos.push("Brindes");
  
    return servicos.join('; ') || 'Nenhum serviço cadastrado';
  };

  const fetchFornecedores = useCallback(async () => {
    // Remove Supabase configuration check since it's always configured
    setIsLoading(true);
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order(sortConfig?.key || 'nome_fornecedor', { ascending: sortConfig?.direction === 'ascending' });

    if (error) {
      toast({ title: "Erro ao buscar fornecedores", description: error.message, variant: "destructive" });
      setFornecedores([]);
      return;
    }

    if (data) {
      const processedData = data.map(fornecedor => ({
        ...fornecedor,
        servicos_oferecidos_display: getServicosOferecidos({...fornecedor, nome_contato: fornecedor.nome_contato || '', nome_fornecedor: fornecedor.nome_fornecedor || '', telefone: fornecedor.telefone || '', whatsapp: fornecedor.whatsapp || '', estado: fornecedor.estado || '', cidade: fornecedor.cidade || '', observacoes: fornecedor.observacoes || '', ativo: fornecedor.ativo !== null ? fornecedor.ativo : true, fretamento: fornecedor.fretamento || false, onibus: fornecedor.onibus || false, semi_leito: fornecedor.semi_leito || false, microonibus: fornecedor.microonibus || false, van: fornecedor.van || false, carro: fornecedor.carro || false, hospedagem: fornecedor.hospedagem || false, tipohospedagem: fornecedor.tipohospedagem || '', guias: fornecedor.guias || false, passeios: fornecedor.passeios || false, ingressos: fornecedor.ingressos || false, estacionamentos: fornecedor.estacionamentos || false, brindes: fornecedor.brindes || false})
      }));
      const formattedData: ReportFornecedorData[] = processedData.map(f => ({
        id: f.id,
        nome_fornecedor: f.nome_fornecedor || '',
        nome_contato: f.nome_contato || '',
        telefone: f.telefone || '',
        whatsapp: f.whatsapp ? applyPhoneMask(f.whatsapp) : '',
        estado: f.estado || '',
        cidade: f.cidade || '',
        fretamento: f.fretamento || false,
        onibus: f.onibus || false,
        semi_leito: f.semi_leito || false,
        microonibus: f.microonibus || false,
        van: f.van || false,
        carro: f.carro || false,
        hospedagem: f.hospedagem || false,
        tipohospedagem: f.tipohospedagem || '',
        guias: f.guias || false,
        passeios: f.passeios || false,
        ingressos: f.ingressos || false,
        estacionamentos: f.estacionamentos || false,
        brindes: f.brindes || false,
        observacoes: f.observacoes || '',
        ativo: f.ativo !== null ? f.ativo : true,
        servicos_oferecidos_display: f.servicos_oferecidos_display,
      }));
      setFornecedores(formattedData);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const sortedFornecedores = useMemo(() => {
    let sortableItems = [...fornecedores];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Handle boolean 'ativo' field for sorting
        if (sortConfig.key === 'ativo') {
            aValue = a.ativo ? 1 : 0;
            bValue = b.ativo ? 1 : 0;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue === null || aValue === undefined) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        if (bValue === null || bValue === undefined) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;


        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [fornecedores, sortConfig]);

  const requestSort = (key: SortableFornecedorKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableFornecedorKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortableFornecedorKey, className?: string) => (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10 ${className || ''}`}
      onClick={() => requestSort(key)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center">{label}{getSortIcon(key)}</div>
    </th>
  );

  const handlePrintColumnToggle = (key: SortableFornecedorKey) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, isSelected: !col.isSelected } : col
      )
    );
  };

  const handlePrintColumnOrderChange = (key: SortableFornecedorKey, order: string) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, printOrder: order } : col
      )
    );
  };

  const handleInitiatePrint = () => {
    const selectedForPrint = printColumnConfig
      .filter(col => col.isSelected)
      .map(col => ({ ...col, printOrderNum: parseInt(col.printOrder, 10) || Infinity }))
      .sort((a, b) => a.printOrderNum - b.printOrderNum);

    if (selectedForPrint.length === 0) {
      toast({ title: "Nenhuma Coluna", description: "Selecione colunas para imprimir.", variant: "warning" });
      return;
    }
    // Ensure ReportFornecedorData is compatible with ReportFornecedorDataPrint for keys
    const finalPrintColumns: PrintFornecedorColumn[] = selectedForPrint.map(col => ({ 
        key: col.key as keyof ReportFornecedorData, // Or cast to specific print data type keys
        label: col.label 
    }));
    
    // Sort by 'nome_fornecedor' for printing
    const dataSortedForPrint = [...fornecedores].sort((a, b) => 
        a.nome_fornecedor.localeCompare(b.nome_fornecedor)
    );

    setPrintableData({ columns: finalPrintColumns, fornecedores: dataSortedForPrint });
    setShowPrintModal(false);
    setIsPrinting(true);
  };
  
  useEffect(() => {
    if (isPrinting && printableData && printAreaTarget) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printableData, printAreaTarget]);

  const handleExportToCsv = () => {
    if (sortedFornecedores.length === 0) {
        toast({ title: "Nenhum Dado", description: "Não há dados para exportar.", variant: "warning" });
        return;
    }

    // Use the same columns as for printing, respecting selection and order
    const csvColumns = printColumnConfig
        .filter(col => col.isSelected)
        .map(col => ({ ...col, printOrderNum: parseInt(col.printOrder, 10) || Infinity }))
        .sort((a, b) => a.printOrderNum - b.printOrderNum);

    const headers = csvColumns.map(col => `"${col.label.replace(/"/g, '""')}"`);
    
    const dataRows = sortedFornecedores.map(f => {
      return csvColumns.map(col => {
        let value = col.key === 'servicos_oferecidos_display' ? f.servicos_oferecidos_display : f[col.key as keyof ReportFornecedorData];
        if (col.key === 'ativo') {
          value = f.ativo ? 'Sim' : 'Não';
        }
        // Ensure all values are strings and quotes are handled
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      }).join(";");
    });

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + dataRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_fornecedores.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportado!", description: "Relatório de fornecedores exportado para CSV." });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando fornecedores...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setShowPrintModal(true)}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
        >
          <Printer size={18} className="mr-2" />
          Imprimir
        </button>
        <button
          onClick={handleExportToCsv}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
        >
          <FileDown size={18} className="mr-2" />
          Exportar CSV
        </button>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Opções de Impressão</h3><button onClick={() => setShowPrintModal(false)}><XCircle size={24} /></button></div>
            <p className="text-sm text-gray-600 mb-4">Selecione as colunas e defina a ordem (ex: 1, 2, 3...).</p>
            <div className="space-y-2 overflow-y-auto pr-2 flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {printColumnConfig.map(col => (
                <div key={col.key} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <input type="checkbox" id={`print-forn-col-${col.key}`} checked={col.isSelected} onChange={() => handlePrintColumnToggle(col.key)} className="mr-2 h-4 w-4"/>
                    <label htmlFor={`print-forn-col-${col.key}`} className="text-sm">{col.label}</label>
                  </div>
                  <input type="number" min="1" value={col.printOrder} onChange={(e) => handlePrintColumnOrderChange(col.key, e.target.value)} className="w-16 p-1 border rounded-md text-sm text-center" placeholder="Ordem" disabled={!col.isSelected}/>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancelar</button>
              <button onClick={handleInitiatePrint} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"><Printer size={18} className="mr-2" />Imprimir</button>
            </div>
          </div>
        </div>
      )}
      
      {isPrinting && printableData && printAreaTarget &&
        ReactDOM.createPortal(
          <PrintableFornecedoresReport columns={printableData.columns} fornecedores={printableData.fornecedores} />,
          printAreaTarget
        )
      }

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('Fornecedor', 'nome_fornecedor')}
                {renderHeader('Contato', 'nome_contato')}
                {renderHeader('WhatsApp', 'whatsapp')}
                {renderHeader('Cidade', 'cidade')}
                {renderHeader('UF', 'estado')}
                {renderHeader('Serviços Oferecidos', 'servicos_oferecidos_display')}
                {renderHeader('Observações', 'observacoes')}
                {renderHeader('Ativo?', 'ativo', 'text-center')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{f.nome_fornecedor}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{f.nome_contato}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{f.whatsapp}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{f.cidade}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{f.estado}</td>
                  <td className="px-3 py-2 whitespace-normal text-xs text-gray-700 break-words min-w-[200px] max-w-xs">{f.servicos_oferecidos_display}</td>
                  <td className="px-3 py-2 whitespace-normal text-xs text-gray-700 break-words min-w-[150px] max-w-xs">{f.observacoes}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${f.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {f.ativo ? 'Sim' : 'Não'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedFornecedores.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FornecedoresReport;
