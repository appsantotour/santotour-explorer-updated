import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { PassageiroFormData } from '../../types';
import SelectField from '../SelectField';
import { applyCpfMask } from '../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY } from '../../utils/dateUtils';
import { Loader2, Trash2, Printer, Save, AlertTriangle } from 'lucide-react';
import PrintableGerenciamentoPoltronas from './prints/PrintableGerenciamentoPoltronas';


interface ViagemOption {
  value: string;
  label: string;
  qtdeassentos?: number;
}

interface PassengerSeatData extends Omit<PassageiroFormData, 'poltrona'> {
  poltrona: number | null; // Keep as number for internal use
}

const GerenciamentoPoltronas: React.FC = () => {
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripOptions, setTripOptions] = useState<ViagemOption[]>([]);
  const [passengers, setPassengers] = useState<PassengerSeatData[]>([]);
  const [tripSeatCount, setTripSeatCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [isPrinting, setIsPrinting] = useState(false);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);
  const [printableTripInfo, setPrintableTripInfo] = useState<{ nomeViagem: string; dataViagem: string } | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      // Remove Supabase configuration check since it's always configured
      setIsLoading(true);
      const { data, error } = await supabase
        .from('viagens')
        .select('id, destino, datapartida, qtdeassentos')
        .order('datapartida', { ascending: false }); // Show recent trips first

      if (error) {
        toast({ title: "Erro ao buscar viagens", description: error.message, variant: "destructive" });
      } else if (data) {
        const options = data.map(v => ({
          value: v.id,
          label: `${v.destino || 'Viagem s/ Destino'} - ${formatDateForDisplayDDMMYYYY(v.datapartida) || 'Data Indef.'}`,
          qtdeassentos: v.qtdeassentos || 0,
        }));
        setTripOptions([{ value: '', label: 'Selecione uma Viagem' }, ...options]);
      }
      setIsLoading(false);
    };
    fetchTrips();
  }, [toast]);

  useEffect(() => {
    const fetchPassengersAndTripDetails = async () => {
      if (!selectedTripId) {
        setPassengers([]);
        setTripSeatCount(0);
        setPrintableTripInfo(null);
        return;
      }
      setIsLoading(true);

      const selectedTripOption = tripOptions.find(opt => opt.value === selectedTripId);
      if (selectedTripOption) {
        setTripSeatCount(selectedTripOption.qtdeassentos || 0);
        setPrintableTripInfo({
            nomeViagem: selectedTripOption.label.split(' - ')[0],
            dataViagem: selectedTripOption.label.split(' - ')[1] || ''
        });
      } else {
        // Fallback if trip not in options (e.g. direct load or error)
        const { data: tripData, error: tripError } = await supabase
            .from('viagens')
            .select('qtdeassentos, destino, datapartida')
            .eq('id', selectedTripId)
            .single();
        if (tripError || !tripData) {
            toast({ title: "Erro ao buscar detalhes da viagem", description: tripError?.message || "Viagem não encontrada", variant: "destructive"});
            setIsLoading(false);
            return;
        }
        setTripSeatCount(tripData.qtdeassentos || 0);
        setPrintableTripInfo({
            nomeViagem: tripData.destino || 'Viagem s/ Destino',
            dataViagem: formatDateForDisplayDDMMYYYY(tripData.datapartida) || 'Data Indef.'
        });
      }

      const { data, error } = await supabase
        .from('passageiros')
        .select('*')
        .eq('idviagem', selectedTripId)
        .order('nomepassageiro', { ascending: true });

      if (error) {
        toast({ title: "Erro ao buscar passageiros", description: error.message, variant: "destructive" });
        setPassengers([]);
      } else {
        setPassengers(data.map(p => ({ 
          ...p, 
          poltrona: p.poltrona,
          bairropassageiro: p.bairropassageiro || undefined,
          cidadepassageiro: p.cidadepassageiro || undefined,
          telefonepassageiro: p.telefonepassageiro || undefined,
          enderecoembarquepassageiro: p.enderecoembarquepassageiro || undefined,
          localembarquepassageiro: p.localembarquepassageiro || undefined,
          passageiroobservacao: p.passageiroobservacao || undefined,
          cpfindicador: p.cpfindicador || undefined,
          observacoesparcela2: p.observacoesparcela2 || undefined,
          observacoesparcela3: p.observacoesparcela3 || undefined,
          observacoesparcela4: p.observacoesparcela4 || undefined,
          observacoesparcela5: p.observacoesparcela5 || undefined,
          observacoesparcela6: p.observacoesparcela6 || undefined,
          observacoesparcela7: p.observacoesparcela7 || undefined,
          observacoesparcela8: p.observacoesparcela8 || undefined,
          observacoesparcela9: p.observacoesparcela9 || undefined,
          observacoesparcela10: p.observacoesparcela10 || undefined,
          formapagamentoavista: p.formapagamentoavista || undefined,
          passageiroindicadopor: p.passageiroindicadopor || undefined,
          destino: p.destino || undefined,
          dataparcela2: p.dataparcela2 || undefined,
          dataparcela3: p.dataparcela3 || undefined,
          dataparcela4: p.dataparcela4 || undefined,
          dataparcela5: p.dataparcela5 || undefined,
          dataparcela6: p.dataparcela6 || undefined,
          dataparcela7: p.dataparcela7 || undefined,
          dataparcela8: p.dataparcela8 || undefined,
          dataparcela9: p.dataparcela9 || undefined,
          dataparcela10: p.dataparcela10 || undefined,
          datasinal: p.datasinal || undefined,
          datapagamentoavista: p.datapagamentoavista || undefined,
          // Convert numeric fields to strings for form compatibility
          descontoindicacoes: p.descontoindicacoes?.toString() || undefined,
          descontopromocional: p.descontopromocional?.toString() || undefined,
          valorfaltareceber: p.valorfaltareceber?.toString() || undefined,
          valorviagem: p.valorviagem?.toString() || '',
          valorsinal: p.valorsinal?.toString() || undefined,
          valorparcela2: p.valorparcela2?.toString() || undefined,
          valorparcela3: p.valorparcela3?.toString() || undefined,
          valorparcela4: p.valorparcela4?.toString() || undefined,
          valorparcela5: p.valorparcela5?.toString() || undefined,
          valorparcela6: p.valorparcela6?.toString() || undefined,
          valorparcela7: p.valorparcela7?.toString() || undefined,
          valorparcela8: p.valorparcela8?.toString() || undefined,
          valorparcela9: p.valorparcela9?.toString() || undefined,
          valorparcela10: p.valorparcela10?.toString() || undefined,
          comissaodivulgacao: p.comissaodivulgacao?.toString() || undefined,
          comissaodivulgacaovalor: p.comissaodivulgacaovalor?.toString() || undefined,
          valortotalpago: p.valortotalpago?.toString() || undefined,
          elegiveldesconto: p.elegiveldesconto === 'true' || false,
          viagemId: p.idviagem || undefined,
          nomeviagem: p.nomeviagem || '',
          datapartida: p.datapartida || '',
          nomepassageiro: p.nomepassageiro || '',
          cpfpassageiro: p.cpfpassageiro || ''
        } as PassengerSeatData)));
      }
      setIsLoading(false);
    };
    fetchPassengersAndTripDetails();
  }, [selectedTripId, toast, tripOptions]);

  const handleSeatChange = (passengerId: string, newSeat: string) => {
    setPassengers(prev =>
      prev.map(p => (p.id === passengerId ? { 
        ...p, 
        poltrona: newSeat ? parseInt(newSeat, 10) : null 
      } : p))
    );
  };

  const getAvailableSeatOptions = (currentPassengerId?: string): { value: string; label: string }[] => {
    if (tripSeatCount === 0) return [{ value: '', label: 'N/A' }];

    const assignedSeats = new Set<string>();
    
    passengers.forEach(p => {
      // Safe check for INT4 (number or null)
      if (p.id !== currentPassengerId && p.poltrona != null) {
        assignedSeats.add(String(p.poltrona).padStart(2, '0'));
      }
    });

    const options: { value: string; label: string }[] = [{ value: '', label: 'N/A' }];
    
    for (let i = 1; i <= tripSeatCount; i++) {
      const seatStr = i.toString().padStart(2, '0');
      if (!assignedSeats.has(seatStr)) {
        options.push({ 
          value: i.toString(), 
          label: seatStr
        });
      }
    }

    const currentPassenger = passengers.find(p => p.id === currentPassengerId);
    if (currentPassenger?.poltrona != null) {
      const currentSeatStr = currentPassenger.poltrona.toString().padStart(2, '0');
      if (!options.some(opt => opt.value === currentPassenger.poltrona?.toString())) {
        options.push({
          value: currentPassenger.poltrona.toString(),
          label: currentSeatStr
        });
      }
    }

    return options.sort((a, b) => {
      if (a.value === '') return -1;
      if (b.value === '') return 1;
      return parseInt(a.value, 10) - parseInt(b.value, 10);
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedTripId || passengers.length === 0) {
      toast({ title: "Nenhuma Alteração", description: "Selecione uma viagem e certifique-se de que há passageiros." });
      return;
    }
    setIsSaving(true);
    let allUpdatesSuccessful = true;

    for (const passenger of passengers) {
      if (passenger.id) { // Ensure passenger has an ID
        // Ensure poltrona is saved as a number (or null) to match Supabase INT4
        const poltronaValue = passenger.poltrona != null ? 
          (typeof passenger.poltrona === 'string' ? parseInt(passenger.poltrona, 10) : passenger.poltrona) : 
          null;

        const { error } = await supabase
          .from('passageiros')
          .update({ poltrona: poltronaValue })
          .eq('id', passenger.id);
          
        if (error) {
          allUpdatesSuccessful = false;
          toast({ 
            title: `Erro ao salvar poltrona para ${passenger.nomepassageiro}`, 
            description: error.message, 
            variant: "destructive" 
          });
          // Continue trying to save others
        }
      }
    }

    if (allUpdatesSuccessful) {
      toast({ 
        title: "Sucesso!", 
        description: "Poltronas salvas com sucesso." 
      });
      
      // Refresh the data to ensure UI is in sync with the database
      const currentSelectedTrip = selectedTripId;
      setSelectedTripId('');
      setTimeout(() => setSelectedTripId(currentSelectedTrip), 100);
    } else {
      toast({ 
        title: "Concluído com Erros", 
        description: "Algumas poltronas não puderam ser salvas. Verifique os logs.", 
        variant: "warning" 
      });
    }
    setIsSaving(false);
  };

  const handleDeletePassenger = async (passengerId: string, passengerName: string) => {
    if (!selectedTripId || !passengerId) return;

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir ${passengerName} desta viagem? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsSaving(true); // Use isSaving to disable buttons during delete
    const { error } = await supabase
      .from('passageiros')
      .delete()
      .eq('id', passengerId);

    if (error) {
      toast({ title: "Erro ao excluir passageiro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Passageiro Excluído", description: `${passengerName} foi removido(a) da viagem.` });
      setPassengers(prev => prev.filter(p => p.id !== passengerId));
    }
    setIsSaving(false);
  };

  const handlePrint = () => {
    if (!selectedTripId || passengers.length === 0 || !printableTripInfo) {
      toast({ title: "Nada para Imprimir", description: "Selecione uma viagem com passageiros.", variant: "warning" });
      return;
    }
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting && printAreaTarget && printableTripInfo) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printAreaTarget, printableTripInfo, passengers]);


  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
                <label htmlFor="tripSelectPassengerSeat" className="block text-sm font-medium text-gray-700 mb-1">
                    Viagem
                </label>
                <SelectField
                    id="tripSelectPassengerSeat"
                    name="tripSelectPassengerSeat"
                    label="" // Label provided above
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    options={tripOptions}
                    disabled={isLoading || isSaving}
                />
            </div>
            <div className="flex space-x-2 justify-start md:justify-end">
                <button
                onClick={handlePrint}
                disabled={isLoading || isSaving || !selectedTripId || passengers.length === 0}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                >
                <Printer size={18} className="mr-2" /> Imprimir
                </button>
                <button
                onClick={handleSaveChanges}
                disabled={isLoading || isSaving || !selectedTripId || passengers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                <Save size={18} className="mr-2" /> {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
      </div>
      
      {isLoading && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /> <span className="ml-2">Carregando...</span></div>}

      {!isLoading && selectedTripId && passengers.length === 0 && (
        <div className="text-center py-6 px-4 bg-yellow-50 border border-yellow-300 rounded-md shadow">
            <AlertTriangle size={24} className="mx-auto text-yellow-500 mb-2" />
            <p className="text-yellow-700 font-medium">Nenhum passageiro encontrado para esta viagem.</p>
            <p className="text-sm text-yellow-600">Cadastre passageiros na seção "Passageiros" para esta viagem.</p>
        </div>
      )}
      
      {!isLoading && selectedTripId && passengers.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CPF</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Poltrona</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Excluir</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passengers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{p.nomepassageiro}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-mono">{applyCpfMask(p.cpfpassageiro)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <SelectField
                        id={`seat-${p.id}`}
                        name={`seat-${p.id}`}
                        label=""
                        value={p.poltrona !== null ? p.poltrona.toString() : ''}
                        onChange={(e) => handleSeatChange(p.id!, e.target.value)}
                        options={getAvailableSeatOptions(p.id)}
                        className="w-full"
                        // Add conditional styling for "N/A"
                        // inputClassName={(!p.poltrona || p.poltrona === 'N/A') ? 'text-red-500' : ''}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleDeletePassenger(p.id!, p.nomepassageiro)}
                        disabled={isSaving}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded-full hover:bg-red-100 transition-colors"
                        aria-label={`Excluir ${p.nomepassageiro}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right text-sm font-semibold text-gray-700 border-t border-gray-200">
            Total de Passageiros: {passengers.length}
          </div>
        </div>
      )}
      {isPrinting && printAreaTarget && printableTripInfo &&
        ReactDOM.createPortal(
          <PrintableGerenciamentoPoltronas
            passengers={passengers as any}
            nomeViagem={printableTripInfo.nomeViagem}
            dataViagem={printableTripInfo.dataViagem}
          />,
          printAreaTarget
        )
      }
    </div>
  );
};

export default GerenciamentoPoltronas;