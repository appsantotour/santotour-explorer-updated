
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { applyCpfMask, applyPhoneMask, formatNumberToBRLCurrency } from '../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY, convertDateToSupabaseFormat } from '../../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Printer, FileDown, XCircle } from 'lucide-react';
import PrintablePassageiroReport, { PrintPassageiroColumn } from './prints/PrintablePassageiroReport';
import SelectField from '../SelectField'; // Added SelectField import

// Define the structure for data displayed in this report
interface ReportPassageiroData {
  id: string; // passageiros.id
  idviagem: string; // passageiros.idviagem
  // Viagem Info
  nomeviagem: string; // from passageiros.nomeviagem (e.g., "Destino - DD/MM/AAAA")
  poltrona?: string | number | null; 
  datapartida_viagem_raw: string; // from passageiros.datapartida (converted to YYYY-MM-DD), for sorting
  // Passageiro Info
  nomepassageiro: string;
  cpfpassageiro: string;
  telefonepassageiro?: string;
  bairropassageiro?: string;
  cidadepassageiro?: string;
  localembarquepassageiro?: string;
  enderecoembarquepassageiro?: string;
  // Indicador Info
  cpfindicador?: string;
  nome_do_seu_indicador?: string; // Fetched from clientes table
  // Status & Observações
  elegiveldesconto: boolean;
  passageiroobservacao?: string;
  // Valores da Viagem (numeric from DB)
  valorviagem: number | null;
  valorsinal?: number | null;
  datasinal?: string; // YYYY-MM-DD from DB
  // Parcelas
  valorparcela2?: number | null; dataparcela2?: string; observacoesparcela2?: string;
  valorparcela3?: number | null; dataparcela3?: string; observacoesparcela3?: string;
  valorparcela4?: number | null; dataparcela4?: string; observacoesparcela4?: string;
  valorparcela5?: number | null; dataparcela5?: string; observacoesparcela5?: string;
  valorparcela6?: number | null; dataparcela6?: string; observacoesparcela6?: string;
  valorparcela7?: number | null; dataparcela7?: string; observacoesparcela7?: string;
  valorparcela8?: number | null; dataparcela8?: string; observacoesparcela8?: string;
  valorparcela9?: number | null; dataparcela9?: string; observacoesparcela9?: string;
  valorparcela10?: number | null; dataparcela10?: string; observacoesparcela10?: string;
  // Descontos e Saldos
  descontopromocional?: number | null;
  descontoindicacoes?: number | null; // Discount this passenger received
  comissaodivulgacaovalor?: number | null; // Commission this passenger generated for their indicator
  valorfaltareceber?: number | null;
}

type SortablePassageiroKey = keyof ReportPassageiroData;

interface SortConfig {
  key: SortablePassageiroKey;
  direction: 'ascending' | 'descending';
}

interface ViagemFilterOption {
  value: string;
  label: string;
  datapartida: string; // YYYY-MM-DD
}

const allPrintableColumnsConfig: Array<{ key: SortablePassageiroKey; label: string; defaultSelected: boolean }> = [
  { key: 'nomeviagem', label: 'Viagem', defaultSelected: true },
  { key: 'poltrona', label: 'Poltrona', defaultSelected: true },
  { key: 'nomepassageiro', label: 'Nome Passageiro', defaultSelected: true },
  { key: 'cpfpassageiro', label: 'CPF Passageiro', defaultSelected: true },
  { key: 'telefonepassageiro', label: 'Telefone', defaultSelected: false },
  { key: 'cidadepassageiro', label: 'Cidade Pas.', defaultSelected: false },
  { key: 'localembarquepassageiro', label: 'Local Embarque', defaultSelected: false },
  { key: 'cpfindicador', label: 'CPF Indicador', defaultSelected: false },
  { key: 'nome_do_seu_indicador', label: 'Nome Indicador', defaultSelected: false },
  { key: 'valorviagem', label: 'Valor Viagem', defaultSelected: true },
  { key: 'valorsinal', label: 'Sinal', defaultSelected: false },
  { key: 'datasinal', label: 'Data Sinal', defaultSelected: false },
  { key: 'descontopromocional', label: 'Desc. Promo', defaultSelected: false },
  { key: 'descontoindicacoes', label: 'Desc. Indic. (Ganho)', defaultSelected: false },
  { key: 'comissaodivulgacaovalor', label: 'Comissão p/ Indicador', defaultSelected: false },
  { key: 'valorfaltareceber', label: 'A Receber', defaultSelected: true },
  { key: 'elegiveldesconto', label: 'Elegível Desc?', defaultSelected: false },
  { key: 'passageiroobservacao', label: 'Obs. Passageiro', defaultSelected: false },
  { key: 'valorparcela2', label: 'Valor Parc. 2', defaultSelected: false },
  { key: 'dataparcela2', label: 'Data Parc. 2', defaultSelected: false },
];


interface PrintColumnConfigItem {
  key: SortablePassageiroKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}


const PassageirosReport: React.FC = () => {
  const [passageirosData, setPassageirosData] = useState<ReportPassageiroData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'nomepassageiro', direction: 'ascending' });
  const { toast } = useToast();

  const [selectedViagemId, setSelectedViagemId] = useState<string>('');
  const [viagemOptionsForFilter, setViagemOptionsForFilter] = useState<ViagemFilterOption[]>([{ value: '', label: 'Todas as Viagens', datapartida: '' }]);
  const [isLoadingViagemOptions, setIsLoadingViagemOptions] = useState(false);


  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printColumnConfig, setPrintColumnConfig] = useState<PrintColumnConfigItem[]>(
    allPrintableColumnsConfig.map(col => ({
      ...col,
      isSelected: col.defaultSelected,
      printOrder: '',
    }))
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [printableData, setPrintableData] = useState<{ 
      columns: PrintPassageiroColumn[]; 
      passageiros: ReportPassageiroData[];
      tripNameAndDateForTitle?: string;
  } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  useEffect(() => {
      const fetchViagemOptions = async () => {
          // Remove Supabase configuration check since it's always configured
          setIsLoadingViagemOptions(true);
          const { data, error } = await supabase
              .from('viagens')
              .select('id, destino, datapartida')
              .order('datapartida', { ascending: false });

          if (error) {
              toast({ title: "Erro ao buscar viagens para filtro", description: error.message, variant: "destructive" });
              setViagemOptionsForFilter([{ value: '', label: 'Erro ao carregar', datapartida: '' }]);
          } else {
              const options: ViagemFilterOption[] = data.map(v => ({
                  value: v.id,
                  label: `${v.destino || 'Viagem s/ Destino'} - ${formatDateForDisplayDDMMYYYY(v.datapartida) || 'Data Indef.'}`,
                  datapartida: v.datapartida // YYYY-MM-DD
              }));
              setViagemOptionsForFilter([{ value: '', label: 'Todas as Viagens', datapartida: '' }, ...options]);
          }
          setIsLoadingViagemOptions(false);
      };
      fetchViagemOptions();
  }, [toast]);

  const fetchPassageirosReportData = useCallback(async (viagemIdToFilter?: string) => {
    // Remove Supabase configuration check since it's always configured
    setIsLoading(true);

    let query = supabase.from('passageiros').select('*');
    
    if (viagemIdToFilter) {
      query = query.eq('idviagem', viagemIdToFilter);
    }

    const { data: passageiros, error: passageirosError } = await query;

    if (passageirosError) {
      toast({ title: "Erro ao buscar passageiros", description: passageirosError.message, variant: "destructive" });
      setPassageirosData([]);
      setIsLoading(false);
      return;
    }

    if (!passageiros || passageiros.length === 0) {
      setPassageirosData([]);
      setIsLoading(false);
      return;
    }

    const indicatorCpfs = [...new Set(passageiros.map(p => p.cpfindicador).filter(Boolean))];
    let indicatorNamesMap = new Map<string, string>();

    if (indicatorCpfs.length > 0) {
      const { data: indicators, error: indicatorsError } = await supabase
        .from('clientes')
        .select('cpf, nome')
        .in('cpf', indicatorCpfs.filter(cpf => cpf != null) as string[]);

      if (indicatorsError) {
        toast({ title: "Erro ao buscar nomes dos indicadores", description: indicatorsError.message, variant: "warning" });
      } else if (indicators) {
        indicators.forEach(ind => indicatorNamesMap.set(ind.cpf, ind.nome));
      }
    }

    const formattedData: ReportPassageiroData[] = passageiros.map(p => ({
      id: p.id,
      idviagem: p.idviagem || '',
      nomeviagem: p.nomeviagem || 'Viagem não informada',
      poltrona: p.poltrona, 
      datapartida_viagem_raw: convertDateToSupabaseFormat(p.datapartida) || '', // Convert DD/MM/AAAA from passageiros.datapartida to YYYY-MM-DD
      nomepassageiro: p.nomepassageiro,
      cpfpassageiro: p.cpfpassageiro,
      telefonepassageiro: p.telefonepassageiro || undefined,
      bairropassageiro: p.bairropassageiro || undefined,
      cidadepassageiro: p.cidadepassageiro || undefined,
      localembarquepassageiro: p.localembarquepassageiro || undefined,
      enderecoembarquepassageiro: p.enderecoembarquepassageiro || undefined,
      cpfindicador: p.cpfindicador || undefined,
      nome_do_seu_indicador: p.cpfindicador ? indicatorNamesMap.get(p.cpfindicador) || 'Indicador não encontrado' : undefined,
      elegiveldesconto: (typeof p.elegiveldesconto === 'string' ? p.elegiveldesconto === 'true' : Boolean(p.elegiveldesconto)),
      passageiroobservacao: p.passageiroobservacao || undefined,
      valorviagem: p.valorviagem,
      valorsinal: p.valorsinal,
      datasinal: p.datasinal || undefined, // Convert null to undefined
      valorparcela2: p.valorparcela2, dataparcela2: p.dataparcela2 || undefined, observacoesparcela2: p.observacoesparcela2 || undefined,
      valorparcela3: p.valorparcela3, dataparcela3: p.dataparcela3 || undefined, observacoesparcela3: p.observacoesparcela3 || undefined,
      valorparcela4: p.valorparcela4, dataparcela4: p.dataparcela4 || undefined, observacoesparcela4: p.observacoesparcela4 || undefined,
      valorparcela5: p.valorparcela5, dataparcela5: p.dataparcela5 || undefined, observacoesparcela5: p.observacoesparcela5 || undefined,
      valorparcela6: p.valorparcela6, dataparcela6: p.dataparcela6 || undefined, observacoesparcela6: p.observacoesparcela6 || undefined,
      valorparcela7: p.valorparcela7, dataparcela7: p.dataparcela7 || undefined, observacoesparcela7: p.observacoesparcela7 || undefined,
      valorparcela8: p.valorparcela8, dataparcela8: p.dataparcela8 || undefined, observacoesparcela8: p.observacoesparcela8 || undefined,
      valorparcela9: p.valorparcela9, dataparcela9: p.dataparcela9 || undefined, observacoesparcela9: p.observacoesparcela9 || undefined,
      valorparcela10: p.valorparcela10, dataparcela10: p.dataparcela10 || undefined, observacoesparcela10: p.observacoesparcela10 || undefined,
      descontopromocional: p.descontopromocional,
      descontoindicacoes: p.descontoindicacoes,
      comissaodivulgacaovalor: p.comissaodivulgacaovalor,
      valorfaltareceber: p.valorfaltareceber,
    }));

    setPassageirosData(formattedData);
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPassageirosReportData(selectedViagemId || undefined);
  }, [fetchPassageirosReportData, selectedViagemId]);

  const sortedPassageiros = useMemo(() => {
    let sortableItems = [...passageirosData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (['datapartida_viagem_raw', 'datasinal', 'dataparcela2', 'dataparcela3', 'dataparcela4', 'dataparcela5', 'dataparcela6', 'dataparcela7', 'dataparcela8', 'dataparcela9', 'dataparcela10'].includes(sortConfig.key)) {
          // Dates are YYYY-MM-DD, direct string comparison works
        } else if (sortConfig.key === 'poltrona') {
          const numA = parseInt(String(aValue), 10);
          const numB = parseInt(String(bValue), 10);
          if (!isNaN(numA) && !isNaN(numB)) {
              aValue = numA;
              bValue = numB;
          } else {
              aValue = String(aValue ?? '').toLowerCase();
              bValue = String(bValue ?? '').toLowerCase();
          }
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          // Numeric fields
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }
        else { 
          aValue = String(aValue ?? '').toLowerCase();
          bValue = String(bValue ?? '').toLowerCase();
        }
        
        if (aValue === null || aValue === undefined) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
        if (bValue === null || bValue === undefined) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [passageirosData, sortConfig]);

  const requestSort = (key: SortablePassageiroKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortablePassageiroKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortablePassageiroKey, className?: string) => (
    <th
      scope="col"
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10 ${className || ''}`}
      onClick={() => requestSort(key)}
      style={{ whiteSpace: 'nowrap' }}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(key)}
      </div>
    </th>
  );

  const handlePrintColumnToggle = (key: SortablePassageiroKey) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, isSelected: !col.isSelected } : col
      )
    );
  };

  const handlePrintColumnOrderChange = (key: SortablePassageiroKey, order: string) => {
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
    const finalPrintColumns: PrintPassageiroColumn[] = selectedForPrint.map(col => ({ key: col.key, label: col.label }));
    
    const dataSortedForPrint = [...sortedPassageiros]; // Use already sorted (and filtered) data

    let titleForPrint: string | undefined = undefined;
    if (selectedViagemId) {
        const selectedTripOption = viagemOptionsForFilter.find(opt => opt.value === selectedViagemId);
        if (selectedTripOption) {
            titleForPrint = selectedTripOption.label; // This is "Destino - DD/MM/AAAA"
        }
    }

    setPrintableData({ 
        columns: finalPrintColumns, 
        passageiros: dataSortedForPrint,
        tripNameAndDateForTitle: titleForPrint 
    });
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
    if (sortedPassageiros.length === 0) {
      toast({ title: "Nenhum Dado", description: "Não há dados para exportar.", variant: "warning" });
      return;
    }

    const csvColumns = allPrintableColumnsConfig
        .map(col => ({
            ...col,
            printOrderNum: parseInt(printColumnConfig.find(pCol => pCol.key === col.key)?.printOrder || '999', 10) || 999,
        }))
        .sort((a,b) => a.printOrderNum - b.printOrderNum);

    const headers = csvColumns.map(col => `"${col.label.replace(/"/g, '""')}"`);
    
    const dataRows = sortedPassageiros.map(p => {
      return csvColumns.map(col => {
        let value = p[col.key];
        if (col.key === 'cpfpassageiro' || col.key === 'cpfindicador') value = applyCpfMask(String(value || ''));
        else if (col.key === 'telefonepassageiro') value = applyPhoneMask(String(value || ''));
        else if (['datapartida_viagem_raw', 'datasinal', 'dataparcela2', 'dataparcela3', 'dataparcela4', 'dataparcela5', 'dataparcela6', 'dataparcela7', 'dataparcela8', 'dataparcela9', 'dataparcela10'].includes(col.key)) {
            value = formatDateForDisplayDDMMYYYY(String(value || ''));
        }
        else if (typeof value === 'number' && ['valorviagem', 'valorsinal', 'valorparcela2', 'valorparcela3', 'valorparcela4', 'valorparcela5', 'valorparcela6', 'valorparcela7', 'valorparcela8', 'valorparcela9', 'valorparcela10', 'descontopromocional', 'descontoindicacoes', 'comissaodivulgacaovalor', 'valorfaltareceber'].includes(col.key)) {
          value = formatNumberToBRLCurrency(value);
        } else if (col.key === 'elegiveldesconto') {
          value = value ? 'Sim' : 'Não';
        }
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      }).join(";");
    });

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(";") + "\n"
        + dataRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    let fileName = "relatorio_passageiros";
    if (selectedViagemId) {
      const selectedTripOption = viagemOptionsForFilter.find(opt => opt.value === selectedViagemId);
      if (selectedTripOption && selectedTripOption.label !== "Todas as Viagens") {
          fileName += `_${selectedTripOption.label.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }
    }
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportado!", description: "Relatório de passageiros exportado para CSV." });
  };


  if (isLoading && passageirosData.length === 0) { // Show loading only if data is empty
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando dados dos passageiros...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="w-full sm:w-auto">
          <SelectField
              id="viagemFilter"
              name="viagemFilter"
              label="Filtrar por Viagem:"
              value={selectedViagemId}
              onChange={(e) => setSelectedViagemId(e.target.value)}
              options={viagemOptionsForFilter}
              disabled={isLoadingViagemOptions || isLoading}
              className="min-w-[300px]"
          />
        </div>
        <div className="flex space-x-2">
          <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
              disabled={isLoading}
          >
              <Printer size={18} className="mr-2" />
              Imprimir
          </button>
          <button
              onClick={handleExportToCsv}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 flex items-center"
              disabled={isLoading}
          >
              <FileDown size={18} className="mr-2" />
              Exportar CSV
          </button>
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Opções de Impressão do Relatório de Passageiros</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Selecione as colunas e defina a ordem (ex: 1, 2, 3...).</p>
            <div className="space-y-2 overflow-y-auto pr-2 flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {printColumnConfig.map(col => (
                <div key={col.key} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`print-pass-col-${col.key}`}
                      checked={col.isSelected}
                      onChange={() => handlePrintColumnToggle(col.key)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`print-pass-col-${col.key}`} className="text-sm text-gray-700">{col.label}</label>
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

      {isPrinting && printableData && printAreaTarget &&
        ReactDOM.createPortal(
          <PrintablePassageiroReport 
              columns={printableData.columns} 
              passageiros={printableData.passageiros}
              tripNameAndDateForTitle={printableData.tripNameAndDateForTitle}
          />,
          printAreaTarget
        )
      }

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto h-[calc(100vh-14rem)]"> {/* Adjust height as needed */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('Viagem (Destino - Data Partida)', 'nomeviagem')}
                {renderHeader('Poltrona', 'poltrona', 'text-center')}
                {renderHeader('Data Partida (Viagem)', 'datapartida_viagem_raw')}
                {renderHeader('Nome Passageiro', 'nomepassageiro')}
                {renderHeader('CPF Passageiro', 'cpfpassageiro')}
                {renderHeader('Telefone', 'telefonepassageiro')}
                {renderHeader('Cidade Pas.', 'cidadepassageiro')}
                {renderHeader('Bairro Pas.', 'bairropassageiro')}
                {renderHeader('Local Embarque', 'localembarquepassageiro')}
                {renderHeader('End. Embarque', 'enderecoembarquepassageiro')}
                {renderHeader('CPF Indicador', 'cpfindicador')}
                {renderHeader('Nome Indicador', 'nome_do_seu_indicador')}
                {renderHeader('Elegível Desc?', 'elegiveldesconto')}
                {renderHeader('Obs. Passageiro', 'passageiroobservacao')}
                {renderHeader('Valor Viagem', 'valorviagem', 'text-right')}
                {renderHeader('Valor Sinal', 'valorsinal', 'text-right')}
                {renderHeader('Data Sinal', 'datasinal')}
                {renderHeader('Valor Parc. 2', 'valorparcela2', 'text-right')}
                {renderHeader('Data Parc. 2', 'dataparcela2')}
                {renderHeader('Desc. Promocional', 'descontopromocional', 'text-right')}
                {renderHeader('Desc. Indicações (Ganho)', 'descontoindicacoes', 'text-right')}
                {renderHeader('Comissão p/ Seu Indicador', 'comissaodivulgacaovalor', 'text-right')}
                {renderHeader('Valor a Receber', 'valorfaltareceber', 'text-right')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPassageiros.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.nomeviagem}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-center">{p.poltrona || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{formatDateForDisplayDDMMYYYY(p.datapartida_viagem_raw)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.nomepassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{applyCpfMask(p.cpfpassageiro)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.telefonepassageiro ? applyPhoneMask(p.telefonepassageiro) : ''}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.cidadepassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.bairropassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.localembarquepassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.enderecoembarquepassageiro}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.cpfindicador ? applyCpfMask(p.cpfindicador) : ''}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.nome_do_seu_indicador}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.elegiveldesconto ? 'Sim' : 'Não'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{p.passageiroobservacao}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.valorviagem)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.valorsinal)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{formatDateForDisplayDDMMYYYY(p.datasinal)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.valorparcela2)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">{formatDateForDisplayDDMMYYYY(p.dataparcela2)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.descontopromocional)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.descontoindicacoes)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.comissaodivulgacaovalor)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-right">{formatNumberToBRLCurrency(p.valorfaltareceber)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedPassageiros.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum passageiro encontrado para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassageirosReport;
