
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
// ViagensFormData import not strictly needed here if ReportTripData is self-contained
import { useToast } from '../../hooks/use-toast';
import { formatDateForDisplayDDMMYYYY, parseUIDateToDate } from '../../utils/dateUtils';
import { formatNumberToBRLCurrency, parseBRLCurrency } from '../../utils/maskUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, FileDown, XCircle } from 'lucide-react';
import PrintableTripReport, { PrintTripColumn } from './prints/PrintableTripReport';

// Define a more specific type for keys that are sortable in this report.
type SortableTripKey = 
  | 'destino' 
  | 'datapartida' 
  | 'dataretorno' 
  | 'precodefinido' 
  | 'qtdepagantesreal'
  | 'receitatotalreal'
  | 'despesatotalreal'
  | 'lucrobrutoreal'
  | 'comissaomaxdivulgacao' // Key for "Desc. e Comissões"
  | 'lucroliquidoreal';

interface SortConfig {
  key: SortableTripKey;
  direction: 'ascending' | 'descending';
}

// Interface for data specifically shaped for this report's display and internal logic
interface ReportTripData {
  id: string;
  destino: string;
  datapartida: string; // DD/MM/AAAA for display
  dataretorno: string; // DD/MM/AAAA for display
  precodefinido: string; // BRL formatted string for display
  qtdepagantesreal: number;
  receitatotalreal: string; // BRL formatted
  despesatotalreal: string; // BRL formatted
  lucrobrutoreal: string; // BRL formatted
  comissaomaxdivulgacao: string; // BRL formatted (original 'Prev. Comissões')
  lucroliquidoreal: string; // BRL formatted
  totaldescontosreal: string; // BRL formatted, used for print calculation
  totalindicacoesreal: string; // BRL formatted, used for print calculation
}

const allPrintableColumnsConfig: Array<{ key: SortableTripKey; label: string; defaultSelected: boolean }> = [
  { key: 'destino', label: 'Destino', defaultSelected: true },
  { key: 'datapartida', label: 'Partida', defaultSelected: true },
  { key: 'dataretorno', label: 'Retorno', defaultSelected: false },
  { key: 'precodefinido', label: 'Preço Viagem', defaultSelected: true },
  { key: 'qtdepagantesreal', label: 'Pagantes', defaultSelected: true },
  { key: 'receitatotalreal', label: 'Receita Total', defaultSelected: true },
  { key: 'despesatotalreal', label: 'Despesa Total', defaultSelected: true },
  { key: 'lucrobrutoreal', label: 'Lucro Bruto', defaultSelected: true },
  { key: 'comissaomaxdivulgacao', label: 'Desc. e Comissões', defaultSelected: true }, // Label updated
  { key: 'lucroliquidoreal', label: 'Lucro Líquido', defaultSelected: true },
];

interface PrintColumnConfigItem {
  key: SortableTripKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}

const ViagensReport: React.FC = () => {
  const [trips, setTrips] = useState<ReportTripData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'datapartida', direction: 'descending' });
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
  const [printableTripData, setPrintableTripData] = useState<{ columns: PrintTripColumn[]; trips: ReportTripData[] } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  const fetchTrips = useCallback(async () => {
    // Remove Supabase configuration check since it's always configured
    setIsLoading(true);
    // Fetch all necessary fields from 'viagens' table
    const { data, error } = await supabase
      .from('viagens')
      .select('id, destino, datapartida, dataretorno, precodefinido, qtdepagantesreal, receitatotalreal, despesatotalreal, lucrobrutoreal, comissaomaxdivulgacao, lucroliquidoreal, totaldescontosreal, totalindicacoesreal')
      .order('datapartida', { ascending: false }); // Default sort by most recent departure

    if (error) {
      toast({ title: "Erro ao buscar viagens", description: error.message, variant: "destructive" });
      setTrips([]);
    } else if (data) {
      const formattedData = data.map(trip => ({
        id: trip.id,
        destino: trip.destino || 'N/A',
        datapartida: formatDateForDisplayDDMMYYYY(trip.datapartida),
        dataretorno: formatDateForDisplayDDMMYYYY(trip.dataretorno),
        precodefinido: formatNumberToBRLCurrency(trip.precodefinido),
        qtdepagantesreal: trip.qtdepagantesreal || 0,
        receitatotalreal: formatNumberToBRLCurrency(trip.receitatotalreal),
        despesatotalreal: formatNumberToBRLCurrency(trip.despesatotalreal),
        lucrobrutoreal: formatNumberToBRLCurrency(trip.lucrobrutoreal),
        comissaomaxdivulgacao: formatNumberToBRLCurrency(trip.comissaomaxdivulgacao), // Stays as is for data fetching
        lucroliquidoreal: formatNumberToBRLCurrency(trip.lucroliquidoreal),
        totaldescontosreal: formatNumberToBRLCurrency(trip.totaldescontosreal),
        totalindicacoesreal: formatNumberToBRLCurrency(trip.totalindicacoesreal),
      }));
      setTrips(formattedData);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const sortedTrips = useMemo(() => {
    let sortableItems = [...trips];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        if (sortConfig.key === 'datapartida' || sortConfig.key === 'dataretorno') {
          const dateA = parseUIDateToDate(aValue);
          const dateB = parseUIDateToDate(bValue);
          if (dateA && dateB) {
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
          } else if (dateA) return sortConfig.direction === 'ascending' ? -1 : 1;
          else if (dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        } else if (['precodefinido', 'receitatotalreal', 'despesatotalreal', 'lucrobrutoreal', 'comissaomaxdivulgacao', 'lucroliquidoreal'].includes(sortConfig.key)) {
          aValue = parseBRLCurrency(aValue);
          bValue = parseBRLCurrency(bValue);
        } else if (sortConfig.key === 'qtdepagantesreal') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        } else if (typeof aValue === 'string' && typeof bValue === 'string' && sortConfig.key === 'destino') {
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
  }, [trips, sortConfig]);

  const requestSort = (key: SortableTripKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableTripKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortableTripKey, className?: string) => (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
      onClick={() => requestSort(key)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(key)}
      </div>
    </th>
  );

  const handlePrintColumnToggle = (key: SortableTripKey) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, isSelected: !col.isSelected } : col
      )
    );
  };

  const handlePrintColumnOrderChange = (key: SortableTripKey, order: string) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, printOrder: order } : col
      )
    );
  };

  const handleInitiatePrint = () => {
    const selectedForPrint = printColumnConfig
      .filter(col => col.isSelected)
      .map(col => ({
        ...col,
        printOrderNum: parseInt(col.printOrder, 10) || Infinity,
      }))
      .sort((a, b) => a.printOrderNum - b.printOrderNum);

    if (selectedForPrint.length === 0) {
      toast({ title: "Nenhuma Coluna Selecionada", description: "Selecione ao menos uma coluna para imprimir.", variant: "warning" });
      return;
    }
    // Ensure the keys passed to PrintTripColumn are valid for ReportTripData
    const finalPrintColumns: PrintTripColumn[] = selectedForPrint.map(col => ({ 
        key: col.key as keyof ReportTripData, // Cast here, assuming ReportTripData is source of truth
        label: col.label 
    }));
    
    // Sort by 'datapartida' (descending) for printing, if not already
    const tripsSortedForPrint = [...trips].sort((a, b) => {
        const dateA = parseUIDateToDate(a.datapartida);
        const dateB = parseUIDateToDate(b.datapartida);
        if (dateA && dateB) {
            return dateB.getTime() - dateA.getTime(); // Descending
        }
        return 0;
    });


    setPrintableTripData({ columns: finalPrintColumns, trips: tripsSortedForPrint });
    setShowPrintModal(false);
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting && printableTripData && printAreaTarget) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printableTripData, printAreaTarget]);
  
  const handleExportToCsv = () => {
    if (sortedTrips.length === 0) {
        toast({ title: "Nenhum Dado", description: "Não há dados para exportar.", variant: "warning" });
        return;
    }

    const headers = [
        "Destino", "Partida (DD/MM/AAAA)", "Retorno (DD/MM/AAAA)", 
        "Preço Viagem (R$)", "Pagantes", "Receita Total (R$)", "Despesa Total (R$)", 
        "Lucro Bruto (R$)", "Desc. e Comissões (R$)", "Lucro Líquido (R$)"
    ];
    
    const dataRows = sortedTrips.map(trip => {
        const descEComissoesNum = (parseBRLCurrency(trip.totaldescontosreal) || 0) + (parseBRLCurrency(trip.totalindicacoesreal) || 0);
        return [
            `"${trip.destino.replace(/"/g, '""')}"`,
            trip.datapartida,
            trip.dataretorno,
            String(parseBRLCurrency(trip.precodefinido) || 0).replace('.',','),
            trip.qtdepagantesreal,
            String(parseBRLCurrency(trip.receitatotalreal) || 0).replace('.',','),
            String(parseBRLCurrency(trip.despesatotalreal) || 0).replace('.',','),
            String(parseBRLCurrency(trip.lucrobrutoreal) || 0).replace('.',','),
            String(descEComissoesNum).replace('.',','), // Calculated value for Desc. e Comissões
            String(parseBRLCurrency(trip.lucroliquidoreal) || 0).replace('.',',')
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + dataRows.map(row => row.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_completo_viagens.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportado!", description: "Relatório completo de viagens exportado para CSV." });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando viagens...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setShowPrintModal(true)}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
        >
          <Printer size={18} className="mr-2" />
          Imprimir Relatório
        </button>
        <button
          onClick={handleExportToCsv}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
        >
          <FileDown size={18} className="mr-2" />
          Exportar para CSV
        </button>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Opções de Impressão do Relatório de Viagens</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Selecione as colunas e defina a ordem (ex: 1, 2, 3...).</p>
            <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
              {printColumnConfig.map(col => (
                <div key={col.key} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`print-trip-col-${col.key}`}
                      checked={col.isSelected}
                      onChange={() => handlePrintColumnToggle(col.key)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`print-trip-col-${col.key}`} className="text-sm text-gray-700">{col.label}</label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={col.printOrder}
                    onChange={(e) => handlePrintColumnOrderChange(col.key, e.target.value)}
                    className="w-16 p-1 border border-gray-300 rounded-md text-sm text-center"
                    placeholder="Ordem"
                    disabled={!col.isSelected}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInitiatePrint}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Printer size={18} className="mr-2" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrinting && printableTripData && printAreaTarget &&
        ReactDOM.createPortal(
          <PrintableTripReport columns={printableTripData.columns} trips={printableTripData.trips} />,
          printAreaTarget
        )
      }

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('Destino', 'destino')}
                {renderHeader('Partida', 'datapartida')}
                {renderHeader('Retorno', 'dataretorno')}
                {renderHeader('Pagantes', 'qtdepagantesreal', 'text-center')}
                {renderHeader('Preço (R$)', 'precodefinido', 'text-right')}
                {renderHeader('Receita Total', 'receitatotalreal', 'text-right')}
                {renderHeader('Despesa Total', 'despesatotalreal', 'text-right')}
                {renderHeader('Lucro Bruto', 'lucrobrutoreal', 'text-right')}
                {renderHeader('Desc. e Comissões', 'comissaomaxdivulgacao', 'text-right')}
                {renderHeader('Lucro Líquido', 'lucroliquidoreal', 'text-right')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTrips.map((trip) => {
                const descEComissoesNum = (parseBRLCurrency(trip.totaldescontosreal) || 0) + (parseBRLCurrency(trip.totalindicacoesreal) || 0);
                const descEComissoesStr = formatNumberToBRLCurrency(descEComissoesNum);
                return (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{trip.destino}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{trip.datapartida}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{trip.dataretorno}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{trip.qtdepagantesreal}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{trip.precodefinido}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{trip.receitatotalreal}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{trip.despesatotalreal}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{trip.lucrobrutoreal}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{descEComissoesStr}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{trip.lucroliquidoreal}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
        {sortedTrips.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhuma viagem encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViagensReport;
