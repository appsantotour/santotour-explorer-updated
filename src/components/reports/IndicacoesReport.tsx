
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { applyCpfMask, formatNumberToBRLCurrency } from '../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY, convertDateToSupabaseFormat } from '../../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, FileDown, XCircle, Filter } from 'lucide-react';
import SelectField from '../SelectField';
import InputField from '../InputField';
import PrintableIndicacoesReport, { PrintIndicacaoColumn } from './prints/PrintableIndicacoesReport';

interface ReportReferralData {
  id: string; // passageiro.id (indicado)
  viagemId: string; // passageiro.idviagem
  viagemDisplay: string; // passageiro.nomeviagem (Destino - DD/MM/AAAA)
  dataPartidaViagemRaw: string; // YYYY-MM-DD from passageiro.datapartida (for sorting)
  
  cpfIndicadorRaw: string;
  nomeIndicador: string;
  
  comissaoValor: number; // passageiro.comissaodivulgacaovalor (commission earned by indicator for this referral)
  
  cpfIndicadoRaw: string; // passageiro.cpfpassageiro
  nomeIndicado: string; // passageiro.nomepassageiro
}

// Added for type safety with PrintIndicacaoColumn
interface ReportReferralDataPrint {
  id: string;
  viagemDisplay: string;
  cpfIndicadorRaw: string;
  nomeIndicador: string;
  comissaoValor: number;
  cpfIndicadoRaw: string;
  nomeIndicado: string;
  dataPartidaViagemRaw?: string; 
  // This interface should align with the data structure PrintableIndicacoesReport expects
  // and must include all keys from allPrintableColumnsConfig.
}


type SortableIndicacoesKey = keyof ReportReferralData;

interface SortConfig {
  key: SortableIndicacoesKey;
  direction: 'ascending' | 'descending';
}

interface FilterOption {
  value: string;
  label: string;
}

const allPrintableColumnsConfig: Array<{ key: SortableIndicacoesKey; label: string; defaultSelected: boolean }> = [
  { key: 'viagemDisplay', label: 'Viagem', defaultSelected: true },
  { key: 'cpfIndicadorRaw', label: 'CPF Indicador', defaultSelected: true },
  { key: 'nomeIndicador', label: 'Nome Indicador', defaultSelected: true },
  { key: 'comissaoValor', label: 'Comissão R$', defaultSelected: true },
  { key: 'cpfIndicadoRaw', label: 'CPF Indicado', defaultSelected: true },
  { key: 'nomeIndicado', label: 'Nome Indicado', defaultSelected: true },
];

interface PrintColumnConfigItem {
  key: SortableIndicacoesKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}

const IndicacoesReport: React.FC = () => {
  const [allReferrals, setAllReferrals] = useState<ReportReferralData[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<ReportReferralData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'viagemDisplay', direction: 'ascending' });
  const { toast } = useToast();

  const [tripOptions, setTripOptions] = useState<FilterOption[]>([{ value: '', label: 'Todas as Viagens' }]);
  
  const [filterTripId, setFilterTripId] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCpf, setFilterCpf] = useState<string>('');

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printColumnConfig, setPrintColumnConfig] = useState<PrintColumnConfigItem[]>(
    allPrintableColumnsConfig.map(col => ({ ...col, isSelected: col.defaultSelected, printOrder: '' }))
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [printableData, setPrintableData] = useState<{ columns: PrintIndicacaoColumn[]; referrals: ReportReferralData[]; reportTitle?: string; } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  // Fetch initial data (referrals and trips for filters)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch passageiros with referrals
      const { data: passageirosComIndicacao, error: passageirosError } = await supabase
        .from('passageiros')
        .select('id, idviagem, nomeviagem, datapartida, cpfindicador, comissaodivulgacaovalor, cpfpassageiro, nomepassageiro')
        .not('cpfindicador', 'is', null)
        .not('comissaodivulgacaovalor', 'is', null)
        .gt('comissaodivulgacaovalor', 0);

      if (passageirosError) {
        toast({ title: "Erro ao buscar indicações", description: passageirosError.message, variant: "destructive" });
        setAllReferrals([]);
        setIsLoading(false);
        return;
      }

      if (passageirosComIndicacao && passageirosComIndicacao.length > 0) {
        const indicatorCpfs = [...new Set(passageirosComIndicacao.map(p => p.cpfindicador).filter(Boolean) as string[])];
        let indicatorNamesMap = new Map<string, string>();

        if (indicatorCpfs.length > 0) {
          const { data: indicators, error: indicatorsError } = await supabase
            .from('clientes')
            .select('cpf, nome')
            .in('cpf', indicatorCpfs);
          if (indicatorsError) {
            toast({ title: "Erro ao buscar nomes dos indicadores", description: indicatorsError.message, variant: "warning" });
          } else if (indicators) {
            indicators.forEach(ind => indicatorNamesMap.set(ind.cpf, ind.nome));
          }
        }

        const formattedReferrals: ReportReferralData[] = passageirosComIndicacao.map(p => ({
          id: p.id,
          viagemId: p.idviagem || '',
          viagemDisplay: p.nomeviagem || 'N/A',
          dataPartidaViagemRaw: convertDateToSupabaseFormat(p.datapartida) || '', // datapartida is DD/MM/AAAA
          cpfIndicadorRaw: p.cpfindicador!, // Not null due to query filter
          nomeIndicador: indicatorNamesMap.get(p.cpfindicador!) || 'Indicador não encontrado',
          comissaoValor: Number(p.comissaodivulgacaovalor) || 0,
          cpfIndicadoRaw: p.cpfpassageiro.replace(/\D/g, ''),
          nomeIndicado: p.nomepassageiro,
        }));
        setAllReferrals(formattedReferrals);

        // Populate trip options for filter
        const uniqueTrips = Array.from(new Set(formattedReferrals.map(r => JSON.stringify({ value: r.viagemId, label: r.viagemDisplay }))))
                              .map(str => JSON.parse(str) as FilterOption);
        uniqueTrips.sort((a, b) => a.label.localeCompare(b.label)); // Sort by trip name/date
        setTripOptions([{ value: '', label: 'Todas as Viagens' }, ...uniqueTrips]);

      } else {
        setAllReferrals([]);
        setTripOptions([{ value: '', label: 'Nenhuma viagem com indicações' }]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [toast]);

  // Apply filters
  useEffect(() => {
    let currentFiltered = [...allReferrals];

    if (filterTripId) {
      currentFiltered = currentFiltered.filter(r => r.viagemId === filterTripId);
    }
    if (filterName.trim()) {
      const lowerFilterName = filterName.trim().toLowerCase();
      currentFiltered = currentFiltered.filter(r => 
        r.nomeIndicador.toLowerCase().includes(lowerFilterName) ||
        r.nomeIndicado.toLowerCase().includes(lowerFilterName)
      );
    }
    if (filterCpf.trim()) {
      const unmaskedCpf = filterCpf.replace(/\D/g, '');
      if (unmaskedCpf) { // Only filter if unmasked CPF is not empty
        currentFiltered = currentFiltered.filter(r =>
          r.cpfIndicadorRaw.includes(unmaskedCpf) ||
          r.cpfIndicadoRaw.includes(unmaskedCpf)
        );
      }
    }
    setFilteredReferrals(currentFiltered);
  }, [allReferrals, filterTripId, filterName, filterCpf]);

  const sortedReferrals = useMemo(() => {
    let sortableItems = [...filteredReferrals];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'comissaoValor') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else {
            aValue = String(aValue ?? '').toLowerCase();
            bValue = String(bValue ?? '').toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredReferrals, sortConfig]);

  const requestSort = (key: SortableIndicacoesKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableIndicacoesKey) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortableIndicacoesKey, className?: string) => (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10 ${className || ''}`}
      onClick={() => requestSort(key)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center">{label}{getSortIcon(key)}</div>
    </th>
  );

  const handlePrintColumnToggle = (key: SortableIndicacoesKey) => {
    setPrintColumnConfig(prev => prev.map(col => col.key === key ? { ...col, isSelected: !col.isSelected } : col));
  };
  const handlePrintColumnOrderChange = (key: SortableIndicacoesKey, order: string) => {
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
    const finalPrintColumns: PrintIndicacaoColumn[] = selectedForPrint.map(col => ({
      key: col.key as keyof ReportReferralDataPrint, 
      label: col.label
    }));
    
    let reportTitleForPrint = "Relatório de Indicações";
    if (filterTripId && tripOptions.find(opt => opt.value === filterTripId)?.label !== "Todas as Viagens") {
        reportTitleForPrint += ` - Viagem: ${tripOptions.find(opt => opt.value === filterTripId)?.label}`;
    }
    
    setPrintableData({ columns: finalPrintColumns, referrals: sortedReferrals, reportTitle: reportTitleForPrint });
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
    if (sortedReferrals.length === 0) {
      toast({ title: "Nenhum Dado", description: "Não há dados para exportar.", variant: "warning" });
      return;
    }
    const csvColumns = printColumnConfig
      .filter(col => col.isSelected)
      .map(col => ({ ...col, printOrderNum: parseInt(col.printOrder, 10) || Infinity }))
      .sort((a, b) => a.printOrderNum - b.printOrderNum);

    const headers = csvColumns.map(col => `"${col.label.replace(/"/g, '""')}"`);
    const dataRows = sortedReferrals.map(r => {
      return csvColumns.map(col => {
        let value = r[col.key];
        if (col.key === 'cpfIndicadorRaw' || col.key === 'cpfIndicadoRaw') value = applyCpfMask(String(value));
        else if (col.key === 'comissaoValor') value = formatNumberToBRLCurrency(Number(value));
        else if (col.key === 'dataPartidaViagemRaw') value = formatDateForDisplayDDMMYYYY(String(value));
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      }).join(";");
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(";") + "\n" + dataRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_indicacoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportado!", description: "Relatório de indicações exportado para CSV." });
  };

  if (isLoading && allReferrals.length === 0) {
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando relatório de indicações...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 p-4 bg-white shadow rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><Filter size={20} className="mr-2 text-blue-600"/>Filtros do Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <SelectField id="tripFilterIndicacoes" name="tripFilterIndicacoes" label="Viagem:" value={filterTripId} onChange={(e) => setFilterTripId(e.target.value)} options={tripOptions} disabled={isLoading} />
          <InputField id="nameFilterIndicacoes" name="nameFilterIndicacoes" label="Nome Indicador/Indicado:" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Digite nome..." disabled={isLoading} />
          <InputField id="cpfFilterIndicacoes" name="cpfFilterIndicacoes" label="CPF Indicador/Indicado:" value={filterCpf} onChange={(e) => setFilterCpf(e.target.value)} maskType="cpf" placeholder="___.___.___-__" disabled={isLoading} />
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
                    <input type="checkbox" id={`print-ind-col-${col.key}`} checked={col.isSelected} onChange={() => handlePrintColumnToggle(col.key)} className="mr-2 h-4 w-4"/>
                    <label htmlFor={`print-ind-col-${col.key}`} className="text-sm">{col.label}</label>
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
        <PrintableIndicacoesReport columns={printableData.columns} referrals={printableData.referrals} reportTitle={printableData.reportTitle} />,
        printAreaTarget
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto h-[calc(100vh-20rem)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('Viagem (Destino - Data Partida)', 'viagemDisplay')}
                {renderHeader('CPF Indicador', 'cpfIndicadorRaw')}
                {renderHeader('Nome Indicador', 'nomeIndicador')}
                {renderHeader('Comissão R$', 'comissaoValor', 'text-right')}
                {renderHeader('CPF Indicado', 'cpfIndicadoRaw')}
                {renderHeader('Nome Indicado', 'nomeIndicado')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReferrals.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{r.viagemDisplay}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{applyCpfMask(r.cpfIndicadorRaw)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{r.nomeIndicador}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(r.comissaoValor)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{applyCpfMask(r.cpfIndicadoRaw)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{r.nomeIndicado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedReferrals.length === 0 && !isLoading && (
          <div className="text-center py-6"><p className="text-gray-500">Nenhuma indicação encontrada para os filtros selecionados.</p></div>
        )}
      </div>
    </div>
  );
};

export default IndicacoesReport;
