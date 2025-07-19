
import React, { useState, useEffect, useCallback } from 'react';
import ViagensForm from '../components/forms/ViagensForm'; 
import SelectField from '../components/SelectField';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { formatDateForDisplayDDMMYYYY, getTodayInSupabaseFormat } from '../utils/dateUtils';

type ViewMode = 'options' | 'new_trip_form' | 'select_upcoming_trip_to_edit' | 'select_past_trip_to_edit' | 'edit_trip_form';

interface ViagemOption {
  value: string;
  label: string;
}

interface PastViagemOption extends ViagemOption {
  datapartida_iso: string; // YYYY-MM-DD
}

const ViagensPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('options');
  const [selectedViagemIdForEdit, setSelectedViagemIdForEdit] = useState<string | null>(null);
  
  const [upcomingViagensOptions, setUpcomingViagensOptions] = useState<ViagemOption[]>([{ value: '', label: 'Selecione uma viagem para editar' }]);
  const [isLoadingUpcomingViagens, setIsLoadingUpcomingViagens] = useState(false);
  
  const [pastViagensOptions, setPastViagensOptions] = useState<PastViagemOption[]>([]);
  const [isLoadingPastViagens, setIsLoadingPastViagens] = useState(false);

  const [allowPastDateEditingForForm, setAllowPastDateEditingForForm] = useState<boolean>(false);
  
  const { toast } = useToast();

  const fetchUpcomingViagensForSelect = useCallback(async () => {
    setIsLoadingUpcomingViagens(true);
    const today = getTodayInSupabaseFormat();
    const { data, error } = await supabase
      .from('viagens')
      .select('id, destino, datapartida')
      .gte('datapartida', today) 
      .order('datapartida', { ascending: true }); 

    if (error) {
      toast({ title: "Erro ao buscar viagens futuras", description: error.message, variant: "destructive" });
      setUpcomingViagensOptions([{ value: '', label: 'Erro ao carregar viagens' }]);
    } else {
      const options = data.map(v => ({
        value: v.id,
        label: `${v.destino || 'Destino não definido'} - ${v.datapartida ? formatDateForDisplayDDMMYYYY(v.datapartida) : 'Data indefinida'}`,
      }));
      setUpcomingViagensOptions([{ value: '', label: 'Selecione uma viagem para editar' }, ...options]);
    }
    setIsLoadingUpcomingViagens(false);
  }, [toast]);

  const fetchPastTripsForSelect = useCallback(async () => {
    setIsLoadingPastViagens(true);
    const today = new Date();
    today.setHours(0,0,0,0);
    const todaySupabaseFormat = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const thirtyDaysAgoDate = new Date(today);
    thirtyDaysAgoDate.setDate(today.getDate() - 30);
    const thirtyDaysAgoSupabaseFormat = `${thirtyDaysAgoDate.getFullYear()}-${String(thirtyDaysAgoDate.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgoDate.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('viagens')
      .select('id, destino, datapartida')
      .gte('datapartida', thirtyDaysAgoSupabaseFormat)
      .lt('datapartida', todaySupabaseFormat)
      .order('datapartida', { ascending: false }); // Show most recent past trips first

    if (error) {
      toast({ title: "Erro ao buscar viagens passadas", description: error.message, variant: "destructive" });
      setPastViagensOptions([]);
    } else {
      const options = data.map(v => ({
        value: v.id,
        label: `${v.destino || 'Destino não definido'} - ${v.datapartida ? formatDateForDisplayDDMMYYYY(v.datapartida) : 'Data indefinida'}`,
        datapartida_iso: v.datapartida, // Store original YYYY-MM-DD
      }));
      setPastViagensOptions(options.length > 0 ? [{ value: '', label: 'Selecione uma viagem passada' } as unknown as PastViagemOption, ...options] : [{ value: '', label: 'Nenhuma viagem nos últimos 30 dias' } as unknown as PastViagemOption]);
    }
    setIsLoadingPastViagens(false);
  }, [toast]);

  useEffect(() => {
    if (viewMode === 'select_upcoming_trip_to_edit' && upcomingViagensOptions.length <= 1) {
      fetchUpcomingViagensForSelect();
    }
    if (viewMode === 'select_past_trip_to_edit' && pastViagensOptions.length <= 1 && pastViagensOptions.find(opt => opt.value === '') === undefined) { // Fetch if empty or only placeholder
      fetchPastTripsForSelect();
    }
  }, [viewMode, fetchUpcomingViagensForSelect, upcomingViagensOptions.length, fetchPastTripsForSelect, pastViagensOptions.length]);

  const handleSelectUpcomingViagemToEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      setSelectedViagemIdForEdit(id);
      setAllowPastDateEditingForForm(false); // Not a past trip, so this specific allowance is false
      setViewMode('edit_trip_form');
    } else {
      setSelectedViagemIdForEdit(null);
    }
  };
  
  const handleSelectPastViagemToEdit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      const selectedOption = pastViagensOptions.find(opt => opt.value === id);
      if (selectedOption) {
        setSelectedViagemIdForEdit(id);
        // The fact it's in this list means it's a past trip within the 30-day window.
        setAllowPastDateEditingForForm(true); 
        setViewMode('edit_trip_form');
      }
    } else {
      setSelectedViagemIdForEdit(null);
      setAllowPastDateEditingForForm(false);
    }
  };


  const handleSaveSuccess = () => {
    // Just refresh the lists, don't change the view mode to keep user on the same page
    fetchUpcomingViagensForSelect(); // Refresh upcoming trips list
    fetchPastTripsForSelect(); // Refresh past trips list
  };

  const handleCancel = () => {
    setViewMode('options');
    setSelectedViagemIdForEdit(null);
    setAllowPastDateEditingForForm(false);
  };

  const handleCancelEditSelection = (targetView: ViewMode = 'options') => {
    setViewMode(targetView);
    setSelectedViagemIdForEdit(null);
    setAllowPastDateEditingForForm(false);
  };

  return (
    <div> 
      {viewMode === 'options' && (
        <div className="space-y-2 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
          <button
            onClick={() => setViewMode('new_trip_form')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Cadastrar Nova Viagem"
          >
            Cadastrar
          </button>
          <button
            onClick={() => {
              setViewMode('select_upcoming_trip_to_edit');
              if (upcomingViagensOptions.length <=1) fetchUpcomingViagensForSelect();
            }}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Editar Viagem Futura"
          >
            Editar
          </button>
          <button
            onClick={() => {
              setViewMode('select_past_trip_to_edit');
              if (pastViagensOptions.length <=1 && pastViagensOptions.find(opt => opt.value === '') === undefined) fetchPastTripsForSelect();
            }}
            className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            aria-label="Editar Viagem Passada"
          >
            Editar (Últimos 30 dias)
          </button>
        </div>
      )}

      {viewMode === 'new_trip_form' && (
        <ViagensForm
          key="new_viagem_form"
          mode="new"
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancel}
          // allowPastDateEditing is implicitly false for new trips or not relevant
        />
      )}

      {viewMode === 'select_upcoming_trip_to_edit' && (
        <div className="max-w-xl mx-auto space-y-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          <SelectField
            id="select_viagem_edit"
            name="select_viagem_edit"
            label="Selecione a Viagem Futura para Editar"
            value={selectedViagemIdForEdit || ''}
            onChange={handleSelectUpcomingViagemToEdit}
            options={upcomingViagensOptions}
            disabled={isLoadingUpcomingViagens}
            required
          />
          {isLoadingUpcomingViagens && <p className="text-sm text-gray-600 animate-pulse">Carregando viagens futuras...</p>}
           <button
            onClick={() => handleCancelEditSelection('options')}
            className="mt-4 px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Voltar para opções"
          >
            Voltar
          </button>
        </div>
      )}

      {viewMode === 'select_past_trip_to_edit' && (
        <div className="max-w-xl mx-auto space-y-4 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          <SelectField
            id="select_past_viagem_edit"
            name="select_past_viagem_edit"
            label="Selecione a Viagem Passada para Editar (Últimos 30 dias)"
            value={selectedViagemIdForEdit || ''}
            onChange={handleSelectPastViagemToEdit}
            options={pastViagensOptions}
            disabled={isLoadingPastViagens}
            required
          />
          {isLoadingPastViagens && <p className="text-sm text-gray-600 animate-pulse">Carregando viagens passadas...</p>}
          {!isLoadingPastViagens && pastViagensOptions.length > 0 && pastViagensOptions[0].value === '' && pastViagensOptions.length === 1 && <p className="text-sm text-gray-500">Nenhuma viagem encontrada nos últimos 30 dias.</p>}
           <button
            onClick={() => handleCancelEditSelection('options')}
            className="mt-4 px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Voltar para opções"
          >
            Voltar
          </button>
        </div>
      )}

      {viewMode === 'edit_trip_form' && selectedViagemIdForEdit && (
        <ViagensForm
          key={selectedViagemIdForEdit}
          mode="edit"
          viagemIdToLoad={selectedViagemIdForEdit}
          onSaveSuccess={handleSaveSuccess}
          onCancel={() => {
            // Determine which select view to return to
            const originalOptionPast = pastViagensOptions.find(opt => opt.value === selectedViagemIdForEdit);
            handleCancelEditSelection(originalOptionPast ? 'select_past_trip_to_edit' : 'select_upcoming_trip_to_edit');
          }}
          allowPastDateEditing={allowPastDateEditingForForm}
        />
      )}
    </div>
  );
};

export default ViagensPage;
