
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
// Removed unused import
import { applyCpfMask, formatNumberToBRLCurrency } from '../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY, convertDateToSupabaseFormat } from '../../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, FileDown, XCircle, Filter } from 'lucide-react';

// Função para formatar o saldo com o sinal correto
const formatSaldo = (value: number): string => {
  if (value > 0) return `-${formatNumberToBRLCurrency(value)}`; // Adiciona sinal negativo se for positivo
  if (value < 0) return `+${formatNumberToBRLCurrency(Math.abs(value))}`; // Adiciona sinal positivo se for negativo
  return formatNumberToBRLCurrency(value); // Mantém o valor zero sem sinal
};
import SelectField from '../SelectField';
import InputField from '../InputField'; // For CPF filter
import PrintablePagamentosReport, { PrintPagamentoColumn } from './prints/PrintablePagamentosReport';

interface FormattedPayment {
  id: string;
  viagemId: string;
  nomeViagemDisplay: string;
  dataPartidaViagemRaw: string;
  nomePassageiro: string;
  cpfPassageiroRaw: string;
  valorViagem: number;
  totalPago: number;
  descontos: number;
  indicacoes: number;
  saldo: number;
  // Keep these for backward compatibility
  tipoPagamento?: string;
  dataPagamentoDisplay?: string;
  dataPagamentoRaw?: string;
  valorPagamento?: number;
  observacaoPagamento?: string | null;
}

type SortablePagamentosKey = keyof FormattedPayment;

interface SortConfig {
  key: SortablePagamentosKey;
  direction: 'ascending' | 'descending';
}

interface FilterOption {
  value: string;
  label: string;
}

const allPrintableColumnsConfig: Array<{ key: SortablePagamentosKey; label: string; defaultSelected: boolean }> = [
  { key: 'nomeViagemDisplay', label: 'VIAGEM', defaultSelected: true },
  { key: 'cpfPassageiroRaw', label: 'CPF', defaultSelected: true },
  { key: 'nomePassageiro', label: 'PASSAGEIRO', defaultSelected: true },
  { key: 'valorViagem', label: 'VALOR VIAGEM', defaultSelected: true },
  { key: 'totalPago', label: 'TOTAL PAGO', defaultSelected: true },
  { key: 'descontos', label: 'DESCONTOS', defaultSelected: true },
  { key: 'indicacoes', label: 'INDICAÇÕES', defaultSelected: true },
  { key: 'saldo', label: 'SALDO', defaultSelected: true },
];

interface PrintColumnConfigItem {
  key: SortablePagamentosKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}

const PagamentosReport: React.FC = () => {
  const [allPayments, setAllPayments] = useState<FormattedPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<FormattedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'dataPagamentoRaw', direction: 'descending' });
  const { toast } = useToast();

  const [tripOptions, setTripOptions] = useState<FilterOption[]>([{ value: '', label: 'Todas as Viagens' }]);
  const [monthOptions, setMonthOptions] = useState<FilterOption[]>([{ value: '', label: 'Todos os Meses' }]);
  
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
  const [cpfSearchTerm, setCpfSearchTerm] = useState<string>('');

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printColumnConfig, setPrintColumnConfig] = useState<PrintColumnConfigItem[]>(
    allPrintableColumnsConfig.map(col => ({ ...col, isSelected: col.defaultSelected, printOrder: '' }))
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [printableData, setPrintableData] = useState<{ columns: PrintPagamentoColumn[]; payments: FormattedPayment[]; reportTitle?: string; } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  // Fetch initial data (all passengers and trips for filters)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch trips for filter dropdown
      const { data: tripsData, error: tripsError } = await supabase
        .from('viagens')
        .select('id, destino, datapartida')
        .order('datapartida', { ascending: false });

      if (tripsError) {
        toast({ title: "Erro ao buscar viagens", description: tripsError.message, variant: "destructive" });
      } else if (tripsData) {
        const options = tripsData.map(t => ({
          value: t.id,
          label: `${t.destino || 'Viagem s/ Destino'} - ${formatDateForDisplayDDMMYYYY(t.datapartida) || 'Data Indef.'}`,
        }));
        setTripOptions([{ value: '', label: 'Todas as Viagens' }, ...options]);
      }

      // Fetch all passenger payment data
      const { data: passageiros, error: passageirosError } = await supabase
        .from('passageiros')
        .select('*'); // Select all columns to get payment details

      if (passageirosError) {
        toast({ title: "Erro ao buscar pagamentos", description: passageirosError.message, variant: "destructive" });
        setAllPayments([]);
        setIsLoading(false);
        return;
      }

      if (passageiros) {
        const formatted: FormattedPayment[] = [];
        const paymentMonths = new Set<string>();

        // Group payments by passenger
        const passengerPayments: Record<string, any> = {};
        
        passageiros.forEach(p => {
          const passengerId = p.id;
          
          if (!passengerPayments[passengerId]) {
            passengerPayments[passengerId] = {
              id: passengerId,
              viagemId: p.idviagem,
              nomeViagemDisplay: p.nomeviagem || 'N/A',
              dataPartidaViagemRaw: convertDateToSupabaseFormat(p.datapartida) || '',
              nomePassageiro: p.nomepassageiro,
              cpfPassageiroRaw: p.cpfpassageiro.replace(/\D/g, ''),
              valorViagem: Number(p.valorviagem) || 0,
              totalPago: 0,
              descontos: Number(p.descontopromocional) || 0,
              indicacoes: p.elegiveldesconto ? (Number(p.descontoindicacoes) || 0) : 0,
              saldo: Number(p.valorfaltareceber) || 0
            };
          }
          
          // Calculate total paid (sinal + all parcelas)
          const parcelas = [
            Number(p.valorsinal) || 0,
            Number(p.valorparcela2) || 0,
            Number(p.valorparcela3) || 0,
            Number(p.valorparcela4) || 0,
            Number(p.valorparcela5) || 0,
            Number(p.valorparcela6) || 0,
            Number(p.valorparcela7) || 0,
            Number(p.valorparcela8) || 0,
            Number(p.valorparcela9) || 0,
            Number(p.valorparcela10) || 0,
          ];
          
          passengerPayments[passengerId].totalPago = parcelas.reduce((sum, val) => sum + val, 0);
          
          // Add payment months for filtering
          if (p.datasinal) {
            paymentMonths.add(p.datasinal.substring(0, 7));
          }
        });
        
        // Convert passengerPayments object to array
        Object.values(passengerPayments).forEach(payment => {
          formatted.push(payment);
        });

        setAllPayments(formatted);

        const sortedMonths = Array.from(paymentMonths).sort().reverse(); // Most recent first
        const monthFilterOptions = sortedMonths.map(monthStr => {
          const [year, month] = monthStr.split('-');
          return {
            value: monthStr, // YYYY-MM
            label: `${month}/${year}` // MM/YYYY
          };
        });
        setMonthOptions([{ value: '', label: 'Todos os Meses' }, ...monthFilterOptions]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let currentFiltered = [...allPayments];

    if (selectedTripId) {
      currentFiltered = currentFiltered.filter(p => p.viagemId === selectedTripId);
    }
    if (selectedMonthYear) { 
      currentFiltered = currentFiltered.filter(p => p.dataPagamentoRaw?.startsWith(selectedMonthYear) || false);
    }
    if (cpfSearchTerm.trim()) {
      const unmaskedCpf = cpfSearchTerm.replace(/\D/g, '');
      currentFiltered = currentFiltered.filter(p => p.cpfPassageiroRaw.includes(unmaskedCpf));
    }
    setFilteredPayments(currentFiltered);
  }, [allPayments, selectedTripId, selectedMonthYear, cpfSearchTerm]);

  const sortedPayments = useMemo(() => {
    let sortableItems = [...filteredPayments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'valorPagamento') {
            // Ensure numeric comparison
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else {
            // Default to string comparison, handling null/undefined
            aValue = String(aValue ?? '').toLowerCase();
            bValue = String(bValue ?? '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPayments, sortConfig]);

  const requestSort = (key: SortablePagamentosKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortablePagamentosKey) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortablePagamentosKey, className?: string) => (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10 ${className || ''}`}
      onClick={() => requestSort(key)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center">{label}{getSortIcon(key)}</div>
    </th>
  );

  const handlePrintColumnToggle = (key: SortablePagamentosKey) => {
    setPrintColumnConfig(prev => prev.map(col => col.key === key ? { ...col, isSelected: !col.isSelected } : col));
  };
  const handlePrintColumnOrderChange = (key: SortablePagamentosKey, order: string) => {
    setPrintColumnConfig(prev => prev.map(col => col.key === key ? { ...col, printOrder: order } : col));
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
    
    // Only include columns that exist in the print interface
    const finalPrintColumns: PrintPagamentoColumn[] = selectedForPrint
      .map(col => ({
        key: col.key as any,
        label: col.label
      }));
    
    let reportTitleForPrint = "Relatório de Pagamentos";
    if (selectedTripId && tripOptions.find(opt => opt.value === selectedTripId)?.label !== "Todas as Viagens") {
        reportTitleForPrint += ` - ${tripOptions.find(opt => opt.value === selectedTripId)?.label}`;
    }
    if (selectedMonthYear && monthOptions.find(opt => opt.value === selectedMonthYear)?.label !== "Todos os Meses") {
        reportTitleForPrint += ` - Mês: ${monthOptions.find(opt => opt.value === selectedMonthYear)?.label}`;
    }


    setPrintableData({ columns: finalPrintColumns, payments: sortedPayments, reportTitle: reportTitleForPrint });
    setShowPrintModal(false);
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting && printableData && printAreaTarget) {
      const timer = setTimeout(() => { window.print(); setIsPrinting(false); }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printableData, printAreaTarget]);

  const handleExportToCsv = () => {
    if (sortedPayments.length === 0) {
      toast({ title: "Nenhum Dado", description: "Não há dados para exportar.", variant: "warning" });
      return;
    }
    const csvColumns = printColumnConfig
      .filter(col => col.isSelected)
      .map(col => ({ ...col, printOrderNum: parseInt(col.printOrder, 10) || Infinity }))
      .sort((a, b) => a.printOrderNum - b.printOrderNum);

    const headers = csvColumns.map(col => `"${col.label.replace(/"/g, '""')}"`);
    const dataRows = sortedPayments.map(p => {
      return csvColumns.map(col => {
        let value = p[col.key];
        if (col.key === 'cpfPassageiroRaw') value = applyCpfMask(String(value));
        else if (col.key === 'valorPagamento') value = formatNumberToBRLCurrency(Number(value));
        // Removed dataPartidaViagemRaw from here as it's no longer a default column for CSV
        else if (col.key === 'dataPagamentoRaw') value = formatDateForDisplayDDMMYYYY(String(value));
        else if (col.key === 'dataPagamentoDisplay' || col.key === 'nomeViagemDisplay') value = String(value); 
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      }).join(";");
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(";") + "\n" + dataRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_pagamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportado!", description: "Relatório de pagamentos exportado para CSV." });
  };

  if (isLoading && allPayments.length === 0) {
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando pagamentos...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 p-4 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><Filter size={20} className="mr-2 text-blue-600"/>Filtros do Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <SelectField id="tripFilter" name="tripFilter" label="Viagem:" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} options={tripOptions} disabled={isLoading} />
          <SelectField id="monthFilter" name="monthFilter" label="Mês do Pagamento:" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} options={monthOptions} disabled={isLoading} />
          <InputField id="cpfFilter" name="cpfFilter" label="CPF do Passageiro:" value={cpfSearchTerm} onChange={(e) => setCpfSearchTerm(e.target.value)} maskType="cpf" placeholder="___.___.___-__" disabled={isLoading} />
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <button onClick={() => setShowPrintModal(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 flex items-center disabled:opacity-50" disabled={isLoading}><Printer size={18} className="mr-2" />Imprimir</button>
        <button onClick={handleExportToCsv} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 flex items-center disabled:opacity-50" disabled={isLoading}><FileDown size={18} className="mr-2" />Exportar CSV</button>
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
                    <input type="checkbox" id={`print-pay-col-${col.key}`} checked={col.isSelected} onChange={() => handlePrintColumnToggle(col.key)} className="mr-2 h-4 w-4"/>
                    <label htmlFor={`print-pay-col-${col.key}`} className="text-sm">{col.label}</label>
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

      {isPrinting && printableData && printAreaTarget && ReactDOM.createPortal(
        <PrintablePagamentosReport 
          columns={printableData.columns} 
          payments={printableData.payments.map(p => ({
            ...p,
            tipoPagamento: p.tipoPagamento || '',
            dataPagamentoDisplay: p.dataPagamentoDisplay || '',
            dataPagamentoRaw: p.dataPagamentoRaw || '',
            valorPagamento: p.valorPagamento || 0,
            observacaoPagamento: p.observacaoPagamento || '',
            saldo: p.saldo || 0 // Ensure SALDO is included with the payment data
          }))} 
          reportTitle={printableData.reportTitle} 
        />,
        printAreaTarget
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('VIAGEM', 'nomeViagemDisplay')}
                {renderHeader('CPF', 'cpfPassageiroRaw')}
                {renderHeader('PASSAGEIRO', 'nomePassageiro')}
                {renderHeader('VALOR VIAGEM', 'valorViagem', 'text-right')}
                {renderHeader('TOTAL PAGO', 'totalPago', 'text-right')}
                {renderHeader('DESCONTOS', 'descontos', 'text-right')}
                {renderHeader('INDICAÇÕES', 'indicacoes', 'text-right')}
                {renderHeader('SALDO', 'saldo', 'text-right')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.nomeViagemDisplay}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{applyCpfMask(p.cpfPassageiroRaw)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.nomePassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.valorViagem)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.totalPago)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.descontos)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.indicacoes)}</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-xs font-medium text-right ${p.saldo > 0 ? 'text-red-600' : p.saldo < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {formatSaldo(p.saldo)}
                  </td>
                </tr>
              ))}
                {/* Summary Row */}
                {sortedPayments.length > 0 && (
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                      {sortedPayments.length} {sortedPayments.length === 1 ? 'passageiro' : 'passageiros'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                      {/* Empty cell for alignment */}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-right">
                      {formatNumberToBRLCurrency(
                        sortedPayments.reduce((sum, p) => sum + p.valorViagem, 0)
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-right">
                      {formatNumberToBRLCurrency(
                        sortedPayments.reduce((sum, p) => sum + p.totalPago, 0)
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-right">
                      {formatNumberToBRLCurrency(
                        sortedPayments.reduce((sum, p) => sum + p.descontos, 0)
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-right">
                      {formatNumberToBRLCurrency(
                        sortedPayments.reduce((sum, p) => sum + p.indicacoes, 0)
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-right">
                      <span className={sortedPayments.reduce((sum, p) => sum + p.saldo, 0) > 0 ? 'text-red-600' : sortedPayments.reduce((sum, p) => sum + p.saldo, 0) < 0 ? 'text-green-600' : 'text-gray-600'}>
                      {formatSaldo(
                        sortedPayments.reduce((sum, p) => sum + p.saldo, 0)
                      )}
                    </span>
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>
        {sortedPayments.length === 0 && !isLoading && (
          <div className="text-center py-6"><p className="text-gray-500">Nenhum pagamento encontrado para os filtros selecionados.</p></div>
        )}
      </div>
    </div>
  );
};

export default PagamentosReport;
