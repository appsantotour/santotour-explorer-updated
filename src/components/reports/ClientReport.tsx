import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom'; // Importar ReactDOM para createPortal
import { supabase } from '../../integrations/supabase/client';
import { ClientFormData, FormFieldName } from '../../types';
import { useToast } from '../../hooks/use-toast';
// import { applyCpfMask } from '../../utils/maskUtils';
import { convertDateToSupabaseFormat, convertDateFromSupabaseFormat } from '../../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Save, Printer, XCircle } from 'lucide-react';
import InputField from '../InputField';
import PrintableClientReport, { PrintColumn } from './prints/PrintableClientReport';

type SortableClientKey = keyof ClientFormData | 'nomeindicadopor_sortable';

interface SortConfig {
  key: SortableClientKey;
  direction: 'ascending' | 'descending';
}

const initialFormData: ClientFormData = {
  id: undefined,
  cpf: '',
  nome: '',
  telefone: '',
  datanascimento: '',
  bairro: '',
  cidade: '',
  localembarque: '',
  enderecoembarque: '',
  indicadopor: '',
  nomeindicadopor: '',
  observacoes: '',
};

const allPrintableColumnsConfig: Array<{ key: SortableClientKey; label: string; defaultSelected: boolean }> = [
  { key: 'cpf', label: 'CPF', defaultSelected: true },
  { key: 'nome', label: 'Nome Completo', defaultSelected: true },
  { key: 'telefone', label: 'Telefone', defaultSelected: false },
  { key: 'datanascimento', label: 'Data Nasc.', defaultSelected: false },
  { key: 'bairro', label: 'Bairro', defaultSelected: false },
  { key: 'cidade', label: 'Cidade', defaultSelected: false },
  { key: 'localembarque', label: 'Local Emb.', defaultSelected: false },
  { key: 'enderecoembarque', label: 'End. Emb.', defaultSelected: false },
  { key: 'nomeindicadopor_sortable', label: 'Indicado Por (Nome)', defaultSelected: false },
  { key: 'observacoes', label: 'Observações', defaultSelected: false },
];

interface PrintColumnConfigItem {
  key: SortableClientKey;
  label: string;
  isSelected: boolean;
  printOrder: string;
}


const ClientReport: React.FC = () => {
  const [, setClients] = useState<ClientFormData[]>([]);
  const [editableClients, setEditableClients] = useState<ClientFormData[]>([]);
  const [changedClientIds, setChangedClientIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
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
  const [printableData, setPrintableData] = useState<{ columns: PrintColumn[]; clients: ClientFormData[] } | null>(null);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Ensure the target element for the portal is available client-side
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);


  const fetchClients = useCallback(async () => {
    // Remove Supabase configuration check since it's always configured
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      toast({ title: "Erro ao buscar clientes", description: error.message, variant: "destructive" });
      setClients([]);
      setEditableClients([]);
    } else if (data) {
      const formattedData = data.map(client => ({
        ...client,
        datanascimento: convertDateFromSupabaseFormat(client.datanascimento),
      }));
      setClients(formattedData as ClientFormData[]);
      setEditableClients(JSON.parse(JSON.stringify(formattedData)) as ClientFormData[]);
    }
    setChangedClientIds(new Set());
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleInputChange = (clientId: string, field: FormFieldName, value: string) => {
    setEditableClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId ? { ...client, [field]: value } : client
      )
    );
    setChangedClientIds(prevIds => new Set(prevIds).add(clientId));
  };

  const handleSaveChanges = async () => {
    if (changedClientIds.size === 0) {
      toast({ title: "Nenhuma Alteração", description: "Nenhum cliente foi modificado.", variant: "default" });
      return;
    }
    // Remove Supabase configuration check since it's always configured

    setIsSaving(true);
    const updates = Array.from(changedClientIds).map(id => {
      const clientData = editableClients.find(c => c.id === id);
      if (!clientData) return Promise.resolve({ error: { message: `Cliente com ID ${id} não encontrado para salvar.` } });
      
      const dataToSave: Partial<ClientFormData> = {
        ...clientData,
        cpf: clientData.cpf.replace(/\D/g, ''),
        telefone: clientData.telefone?.replace(/\D/g, '') || null,
        datanascimento: convertDateToSupabaseFormat(clientData.datanascimento),
        indicadopor: clientData.indicadopor?.replace(/\D/g, '') || null,
      };
      delete dataToSave.id; 

      return supabase.from('clientes').update(dataToSave).eq('id', id);
    });

    try {
      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        errors.forEach(err => {
          toast({ title: "Erro ao Salvar", description: err.error?.message || "Um erro desconhecido ocorreu.", variant: "destructive" });
        });
      } else {
        toast({ title: "Sucesso!", description: "Todas as alterações foram salvas." });
        fetchClients(); 
      }
    } catch (error: any) {
      toast({ title: "Erro Crítico ao Salvar", description: error.message || "Falha ao processar as atualizações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const sortedClients = useMemo(() => {
    let sortableItems = [...editableClients];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'nomeindicadopor_sortable') {
          aValue = a.nomeindicadopor || '';
          bValue = b.nomeindicadopor || '';
        } else {
          aValue = a[sortConfig.key as keyof ClientFormData];
          bValue = b[sortConfig.key as keyof ClientFormData];
        }

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        if (sortConfig.key === 'datanascimento') {
            const dateA = aValue ? new Date(String(aValue).split('/').reverse().join('-')) : null;
            const dateB = bValue ? new Date(String(bValue).split('/').reverse().join('-')) : null;
            if (dateA && dateB) {
                 if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                 if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            } else if (dateA) { 
                return sortConfig.direction === 'ascending' ? -1 : 1;
            } else if (dateB) { 
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [editableClients, sortConfig]);

  const requestSort = (key: SortableClientKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableClientKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />;
  };

  const renderHeader = (label: string, key: SortableClientKey, className?: string) => (
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

  const handlePrintColumnToggle = (key: SortableClientKey) => {
    setPrintColumnConfig(prev =>
      prev.map(col =>
        col.key === key ? { ...col, isSelected: !col.isSelected } : col
      )
    );
  };

  const handlePrintColumnOrderChange = (key: SortableClientKey, order: string) => {
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

    const finalPrintColumns: PrintColumn[] = selectedForPrint.map(col => ({ key: col.key, label: col.label }));
    
    const clientsSortedByName = [...editableClients].sort((a, b) => {
        const nameA = a.nome.toLowerCase();
        const nameB = b.nome.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    setPrintableData({ columns: finalPrintColumns, clients: clientsSortedByName });
    setShowPrintModal(false);
    setIsPrinting(true);
  };
  
  useEffect(() => {
    if (isPrinting && printableData && printAreaTarget) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false); 
        // setPrintableData(null); // Optionally clear data if not needed anymore
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printableData, printAreaTarget]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p className="text-lg animate-pulse">Carregando clientes...</p></div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setShowPrintModal(true)}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Printer size={18} className="mr-2" />
          Imprimir Relatório
        </button>
        <button
          onClick={handleSaveChanges}
          disabled={isSaving || changedClientIds.size === 0}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Save size={18} className="mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'} 
          {changedClientIds.size > 0 && !isSaving && ` (${changedClientIds.size})`}
        </button>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Opções de Impressão</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Selecione as colunas e defina a ordem (ex: 1, 2, 3...). Colunas sem ordem ou com o mesmo número seguirão a ordem padrão.</p>
            <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
              {printColumnConfig.map(col => (
                <div key={col.key} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`print-col-${col.key}`}
                      checked={col.isSelected}
                      onChange={() => handlePrintColumnToggle(col.key)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`print-col-${col.key}`} className="text-sm text-gray-700">{col.label}</label>
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
          <PrintableClientReport columns={printableData.columns} clients={printableData.clients} />,
          printAreaTarget
        )
      }

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderHeader('CPF', 'cpf', 'w-1/12')}
                {renderHeader('Nome', 'nome', 'w-1/6')}
                {renderHeader('Telefone', 'telefone', 'w-1/12')}
                {renderHeader('Data Nasc.', 'datanascimento', 'w-1/12')}
                {renderHeader('Bairro', 'bairro', 'w-1/6')}
                {renderHeader('Cidade', 'cidade', 'w-1/12')}
                {renderHeader('Local Emb.', 'localembarque', 'w-1/6')}
                {renderHeader('End. Emb.', 'enderecoembarque', 'w-1/12')}
                {renderHeader('Indic. Por', 'nomeindicadopor_sortable', 'w-1/6')}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClients.map((client) => (
                <tr key={client.id || client.cpf} className={`hover:bg-gray-50 transition-colors duration-150 ${changedClientIds.has(client.id!) ? 'bg-yellow-50' : ''}`}>
                  {(Object.keys(initialFormData) as Array<keyof ClientFormData>)
                    .filter(key => key !== 'id' && key !== 'observacoes' && key !== 'indicadopor') 
                    .map(fieldKey => {
                      const maskType = fieldKey === 'cpf' ? 'cpf' : fieldKey === 'telefone' ? 'phone' : fieldKey === 'datanascimento' ? 'date' : undefined;
                      const placeholder = fieldKey === 'datanascimento' ? 'DD/MM/AAAA' : '';
                      const maxLength = fieldKey === 'cpf' ? 14 : fieldKey === 'telefone' ? 15 : fieldKey === 'datanascimento' ? 10 : undefined;
                      
                      if (fieldKey === 'nomeindicadopor') {
                        return (
                          <td key={fieldKey} className="px-2 py-1 whitespace-nowrap">
                            <InputField
                              id={`${client.id}-${fieldKey}`}
                              name={fieldKey}
                              label="" 
                              value={String(client[fieldKey] || '')}
                              onChange={(e) => handleInputChange(client.id!, fieldKey, e.target.value)}
                              className="w-full text-xs"
                              inputClassName="p-1 text-xs"
                              placeholder="Nome Indicador"
                            />
                          </td>
                        );
                      }
                      
                      return (
                        <td key={fieldKey} className="px-2 py-1 whitespace-nowrap">
                          <InputField
                            id={`${client.id}-${fieldKey}`}
                            name={fieldKey}
                            label="" 
                            value={String(client[fieldKey] || '')}
                            onChange={(e) => handleInputChange(client.id!, fieldKey, e.target.value)}
                            maskType={maskType}
                            maxLength={maxLength}
                            className="w-full text-xs"
                            inputClassName="p-1 text-xs"
                            placeholder={placeholder || fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
                          />
                        </td>
                      );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedClients.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReport;