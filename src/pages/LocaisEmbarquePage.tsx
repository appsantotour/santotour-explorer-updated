
import React, { useState, useEffect, useCallback } from 'react';
import LocaisEmbarqueForm from '../components/forms/LocaisEmbarqueForm';
import SelectField from '../components/SelectField';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { LocaisEmbarqueFormData } from '../types'; 
import { Trash2 } from 'lucide-react';

type ViewMode = 'options' | 'new_form' | 'select_to_edit' | 'edit_form' | 'delete_list';

interface LocalOption {
  value: string;
  label: string;
}

const LocaisEmbarquePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('options');
  const [selectedLocalIdForEdit, setSelectedLocalIdForEdit] = useState<string | null>(null);
  const [locaisOptions, setLocaisOptions] = useState<LocalOption[]>([{ value: '', label: 'Selecione um local para editar' }]);
  const [locaisToDelete, setLocaisToDelete] = useState<LocaisEmbarqueFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchLocaisForSelect = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('locais_embarque')
      .select('id, localembarque, cidade')
      .order('localembarque', { ascending: true }); 

    if (error) {
      toast({ title: "Erro ao buscar locais", description: error.message, variant: "destructive" });
      setLocaisOptions([{ value: '', label: 'Erro ao carregar locais' }]);
    } else {
      const options = data.map(l => ({
        value: l.id,
        label: `${l.localembarque || 'Local não definido'} (${l.cidade || 'Cidade não definida'})`,
      }));
      setLocaisOptions([{ value: '', label: 'Selecione um local para editar' }, ...options]);
    }
    setIsLoading(false);
  }, [toast]);

  const fetchLocaisForDeleteList = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('locais_embarque')
      .select('id, localembarque, enderecoembarque, cidade')
      .order('localembarque', { ascending: true });

    if (error) {
      toast({ title: "Erro ao buscar locais", description: error.message, variant: "destructive" });
      setLocaisToDelete([]);
    } else {
      setLocaisToDelete(data as LocaisEmbarqueFormData[]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (viewMode === 'select_to_edit') {
      fetchLocaisForSelect();
    }
    if (viewMode === 'delete_list') {
      fetchLocaisForDeleteList();
    }
  }, [viewMode, fetchLocaisForSelect, fetchLocaisForDeleteList]);

  const handleSelectLocalToEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      setSelectedLocalIdForEdit(id);
      setViewMode('edit_form');
    } else {
      setSelectedLocalIdForEdit(null);
    }
  };
  
  const handleSaveSuccess = () => {
    toast({ title: "Operação Concluída", description: "Dados do local de embarque salvos com sucesso." });
    setViewMode('options');
    setSelectedLocalIdForEdit(null);
    // Refresh lists if needed, e.g., if user navigates back to select or delete
    if (locaisOptions.length > 1) fetchLocaisForSelect();
    if (locaisToDelete.length > 0) fetchLocaisForDeleteList();
  };

  const handleCancelForm = () => {
    setViewMode('options');
    setSelectedLocalIdForEdit(null);
  };
  
  const handleDeleteLocal = async (localId: string, localName: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o local "${localName}"? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsLoading(true);
    const { error } = await supabase
        .from('locais_embarque')
        .delete()
        .eq('id', localId);
    setIsLoading(false);

    if (error) {
        toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Local Excluído", description: `O local "${localName}" foi excluído com sucesso.` });
        fetchLocaisForDeleteList(); // Refresh the list
        if (locaisOptions.length > 1) fetchLocaisForSelect(); // Also refresh select options
    }
  };


  return (
    <div>
      <div className="mb-2 mr-0 md:mr-3">
      {viewMode === 'options' && (
        <div className="space-y-2 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
          <button
            onClick={() => setViewMode('new_form')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Cadastrar Novo Local de Embarque"
          >
            Cadastrar
          </button>
          <button
            onClick={() => setViewMode('select_to_edit')}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Atualizar Local de Embarque Existente"
          >
            Atualizar
          </button>
          <button
            onClick={() => setViewMode('delete_list')}
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Excluir Local de Embarque"
          >
            Excluir
          </button>
        </div>
        
      )}</div>

      {viewMode === 'new_form' && (
        <LocaisEmbarqueForm
          key="new_local_form"
          mode="new"
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelForm}
        />
      )}

      {viewMode === 'select_to_edit' && (
        <div className="max-w-xl mx-auto space-y-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          <SelectField
            id="select_local_edit"
            name="select_local_edit"
            label="Selecione o Local para Editar"
            value={selectedLocalIdForEdit || ''}
            onChange={handleSelectLocalToEdit}
            options={locaisOptions}
            disabled={isLoading}
            required
          />
          {isLoading && <p className="text-sm text-gray-600 animate-pulse">Carregando locais...</p>}
           <button
            onClick={handleCancelForm}
            className="mt-4 px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Voltar para opções"
          >
            Voltar
          </button>
        </div>
      )}

      {viewMode === 'edit_form' && selectedLocalIdForEdit && (
        <LocaisEmbarqueForm
          key={selectedLocalIdForEdit}
          mode="edit"
          localIdToLoad={selectedLocalIdForEdit}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => {
            setViewMode('select_to_edit'); // Go back to selection
            setSelectedLocalIdForEdit(null);
          }}
        />
      )}

      {viewMode === 'delete_list' && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            EXCLUIR LOCAL DE EMBARQUE
          </h2>
          {isLoading && <p className="text-sm text-gray-600 animate-pulse">Carregando locais...</p>}
          {!isLoading && locaisToDelete.length === 0 && <p>Nenhum local de embarque cadastrado para excluir.</p>}
          {!isLoading && locaisToDelete.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {locaisToDelete.map(local => (
                <div key={local.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-700">{local.localembarque}</p>
                    <p className="text-sm text-gray-500">{local.enderecoembarque} - {local.cidade}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocal(local.id!, local.localembarque)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                    aria-label={`Excluir local ${local.localembarque}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelForm}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Voltar para opções"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocaisEmbarquePage;