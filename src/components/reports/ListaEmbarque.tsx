
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import SelectField from '../SelectField';
import { formatDateForDisplayDDMMYYYY } from '../../utils/dateUtils';
import { Clock, Home, Users, GripVertical, Printer, Save, Trash2, AlertTriangle, Bus, ArrowDownUp } from 'lucide-react';
import PrintableListaEmbarque from './prints/PrintableListaEmbarque';
import ReactDOM from 'react-dom';

interface ViagemOption {
  value: string;
  label: string;
  destino: string;
  datapartida: string; // YYYY-MM-DD
}

interface PassengerName {
  id: string;
  primeiroNome: string;
}

interface BoardingLocation {
  id: string;
  localembarque: string;
  enderecoembarque: string;
  passageiros: PassengerName[];
  horario: string; // Formato HH:MM
}

const ItemTypes = {
  CARD: 'card',
};

interface DraggableCardProps {
  item: BoardingLocation;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onTimeChange: (localEmbarque: string, time: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ item, index, moveCard, onTimeChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let time = e.target.value.replace(/[^0-9:]/g, '');
    const nativeEvent = e.nativeEvent as InputEvent; // Cast to InputEvent
    if (time.length === 2 && !time.includes(':') && nativeEvent.inputType !== 'deleteContentBackward') {
      time += ':';
    }
    if (time.length > 5) {
      time = time.substring(0, 5);
    }
    onTimeChange(item.localembarque, time);
  };


  return (
    <div
      ref={ref}
      className={`bg-white p-4 rounded-lg shadow-md border border-gray-500 mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'} cursor-grab`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <div className="flex items-center mb-1">
            <Bus size={20} className="text-blue-600 mr-2" />
            <h3 className="text-md font-semibold text-gray-800">{item.localembarque}</h3>
          </div>
          <div className="flex items-center text-xs text-gray-600 mb-2 ml-1">
            <Home size={14} className="mr-1.5" />
            <span>{item.enderecoembarque || 'Endereço não informado'}</span>
          </div>
          <div className="flex items-start text-xs text-gray-600 ml-1">
            <Users size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              {item.passageiros.map(p => p.primeiroNome).join(', ')}
              {item.passageiros.length > 0 ? ` (${item.passageiros.length} passageiro${item.passageiros.length > 1 ? 's' : ''})` : '(Nenhum passageiro)'}
            </p>
          </div>
        </div>
        <div className="flex items-center ml-4">
          <Clock size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            value={item.horario || '--:--'}
            onChange={handleTimeChange}
            placeholder="HH:MM"
            maxLength={5}
            className="w-20 p-2 border border-gray-300 rounded-md text-center text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
          />
          <div ref={drag as any} className="ml-3 p-1 cursor-grab touch-none">
            <GripVertical size={20} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};


export const ListaEmbarque: React.FC = () => {
  const [selectedViagem, setSelectedViagem] = useState<ViagemOption | null>(null);
  const [viagemOptions, setViagemOptions] = useState<ViagemOption[]>([]);
  const [boardingLocations, setBoardingLocations] = useState<BoardingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [isPrinting, setIsPrinting] = useState(false);
  const [printAreaTarget, setPrintAreaTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintAreaTarget(document.getElementById('printable-client-report-area'));
  }, []);

  useEffect(() => {
    const fetchViagens = async () => {
      // Remove Supabase configuration check since it's always configured
      setIsLoading(true);
      
      const currentDate = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('viagens')
        .select('id, destino, datapartida')
        .gte('datapartida', currentDate)
        .order('datapartida', { ascending: true }); 

      const { data: pastData, error: pastError } = await supabase
        .from('viagens')
        .select('id, destino, datapartida')
        .lt('datapartida', currentDate)
        .order('datapartida', { ascending: false });

      if (error || pastError) {
        toast({ title: "Erro ao buscar viagens", description: error?.message || pastError?.message, variant: "destructive" });
      } else {
        const futureOptions = data?.map(v => ({
          value: v.id,
          label: `${v.destino || 'Viagem Desconhecida'} - ${formatDateForDisplayDDMMYYYY(v.datapartida)}`,
          destino: v.destino || 'Viagem Desconhecida',
          datapartida: v.datapartida,
        })) || [];

        const pastOptions = pastData?.map(v => ({
          value: v.id,
          label: `${v.destino || 'Viagem Desconhecida'} - ${formatDateForDisplayDDMMYYYY(v.datapartida)}`,
          destino: v.destino || 'Viagem Desconhecida',
          datapartida: v.datapartida,
        })) || [];

        setViagemOptions([{ value: '', label: 'Selecione uma viagem', destino: '', datapartida: '' }, ...futureOptions, ...pastOptions]);
      }
      setIsLoading(false);
    };
    fetchViagens();
  }, [toast]);

  const fetchBoardingDataForTrip = useCallback(async () => {
    if (!selectedViagem || !selectedViagem.value) {
      setBoardingLocations([]);
      return;
    }
    setIsLoading(true);

    // 1. Carregar detalhes completos da viagem selecionada
    const { error: viagemError } = await supabase
      .from('viagens')
      .select('*')
      .eq('id', selectedViagem.value)
      .single();

    if (viagemError) {
      toast({ title: "Erro ao carregar detalhes da viagem", description: viagemError.message, variant: "destructive" });
      setBoardingLocations([]);
      setIsLoading(false);
      return;
    }

    // 2. Carregar passageiros da viagem
    const { data: passageirosData, error: passageirosError } = await supabase
      .from('passageiros')
      .select('id, nomepassageiro, localembarquepassageiro, enderecoembarquepassageiro, idviagem')
      .eq('idviagem', selectedViagem.value);

    if (passageirosError) {
      toast({ title: "Erro ao buscar passageiros", description: passageirosError.message, variant: "destructive" });
      setBoardingLocations([]);
      setIsLoading(false);
      return;
    }

    // 3. Carregar horários existentes da tabela horariosembarques
    const { data: horariosData, error: horariosError } = await supabase
      .from('horariosembarques')
      .select('localembarque, horario')
      .eq('idviagem', selectedViagem.value);

    if (horariosError) {
      toast({ title: "Erro ao buscar horários de embarque", description: horariosError.message, variant: "destructive" });
      // Continuar com dados dos passageiros, horários serão padrão
    }

    // Use horariosembarques table instead of non-existent enderecoembarques
    const { data: enderecosData, error: enderecosError } = await supabase
      .from('horariosembarques')
      .select('localembarque, horario, enderecoembarque')
      .eq('idviagem', selectedViagem.value);

    if (enderecosError) {
      toast({ title: "Erro ao buscar atualizações temporárias", description: enderecosError.message, variant: "destructive" });
    }

    // Mapa para armazenar horários, priorizando atualizações temporárias
    const horarioMap = new Map<string, { horario: string, enderecoembarque: string | null }>();
    
    // Primeiro, adicionar horários definitivos
    if (horariosData) {
      horariosData.forEach(h => {
        horarioMap.set(h.localembarque, { 
          horario: h.horario ? String(h.horario).substring(0, 5) : '--:--',
          enderecoembarque: null
        });
      });
    }

    // Depois, sobrescrever com atualizações temporárias se existirem
    if (enderecosData) {
      enderecosData.forEach(e => {
        horarioMap.set(e.localembarque, {
          horario: e.horario ? String(e.horario).substring(0, 5) : '--:--',
          enderecoembarque: e.enderecoembarque
        });
      });
    }
    
    // 5. Agrupar passageiros por local de embarque
    const groupedByLocation: Record<string, BoardingLocation> = {};
    if (passageirosData) {
      passageirosData.forEach(p => {
        if (!p.localembarquepassageiro) return;

        if (!groupedByLocation[p.localembarquepassageiro]) {
          const horarioInfo = horarioMap.get(p.localembarquepassageiro);
          groupedByLocation[p.localembarquepassageiro] = {
            id: p.localembarquepassageiro,
            localembarque: p.localembarquepassageiro,
            enderecoembarque: p.enderecoembarquepassageiro || horarioInfo?.enderecoembarque || 'Endereço não informado',
            passageiros: [],
            horario: horarioInfo?.horario || '--:--'
          };
        }
        groupedByLocation[p.localembarquepassageiro].passageiros.push({
          id: p.id,
          primeiroNome: p.nomepassageiro.split(' ')[0]
        });
      });
    }
    
    // 6. Ordenar locais de embarque por ordem alfabética
    let locationsArray = Object.values(groupedByLocation);
    locationsArray.sort((a, b) => a.localembarque.localeCompare(b.localembarque));

    setBoardingLocations(locationsArray);
    setIsLoading(false);
  }, [selectedViagem, toast]);

  useEffect(() => {
    fetchBoardingDataForTrip();
  }, [fetchBoardingDataForTrip, selectedViagem]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setBoardingLocations((prevCards) => {
      const newCards = [...prevCards];
      const [draggedItem] = newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedItem);
      return newCards;
    });
  }, []);
  
  const handleTimeChange = async (localEmbarque: string, time: string) => {
    if (!selectedViagem?.value) return;

    // Atualizar estado local
    setBoardingLocations(prev =>
      prev.map(loc =>
        loc.localembarque === localEmbarque ? { ...loc, horario: time } : loc
      )
    );

    // Buscar o endereço atual do local
    const location = boardingLocations.find(loc => loc.localembarque === localEmbarque);
    if (!location) return;

    // Atualizar na tabela enderecoembarques (atualizações temporárias)
    const { error } = await supabase
      .from('horariosembarques')
      .upsert({
        idviagem: selectedViagem.value,
        localembarque: localEmbarque,
        enderecoembarque: location.enderecoembarque,
        horario: time === '--:--' ? null : `${time}:00`
      }, {
        onConflict: 'idviagem,localembarque'
      });

    if (error) {
      console.error('Erro ao salvar horário temporário:', error);
      toast({
        title: "Erro ao salvar horário",
        description: "A alteração será mantida localmente até o salvamento final.",
        variant: "warning"
      });
    }
  };

  const handleSave = async () => {
    if (!selectedViagem || !selectedViagem.value) {
      toast({ title: "Nenhuma viagem selecionada", variant: "warning" });
      return;
    }
    // Remove Supabase configuration check since it's always configured
    setIsSaving(true);

    try {
      // 1. Preparar dados para salvamento
      const horarioUpserts = boardingLocations.map(location => {
        const horarioDbFormat = location.horario && location.horario !== '--:--' && /^\d{2}:\d{2}$/.test(location.horario)
          ? `${location.horario}:00` // Converter HH:MM para HH:MM:SS
          : null;

        return {
          idviagem: selectedViagem.value,
          localembarque: location.localembarque,
          enderecoembarque: location.enderecoembarque,
          horario: horarioDbFormat,
          viagem: `${selectedViagem.destino} - ${formatDateForDisplayDDMMYYYY(selectedViagem.datapartida)}`
        };
      });

      // 2. Salvar horários definitivos na tabela horariosembarques
      const { error: horariosError } = await supabase
        .from('horariosembarques')
        .upsert(horarioUpserts, {
          onConflict: 'idviagem,localembarque'
        });

      if (horariosError) {
        throw new Error(`Erro ao salvar horários definitivos: ${horariosError.message}`);
      }

      // 3. Limpar atualizações temporárias da tabela enderecoembarques
      const { error: limparTempError } = await supabase
        .from('horariosembarques')
        .delete()
        .eq('idviagem', selectedViagem.value);

      if (limparTempError) {
        console.error('Erro ao limpar horários temporários:', limparTempError);
        toast({
          title: "Atenção",
          description: "Horários salvos com sucesso, mas houve um erro ao limpar dados temporários.",
          variant: "warning"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Horários salvos com sucesso!",
          variant: "default"
        });
      }
    } catch (e: any) {
      console.error('Erro ao salvar horários:', e);
      toast({
        title: "Erro ao Salvar",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      // Recarregar dados para confirmar as alterações
      fetchBoardingDataForTrip();
    }
  };

  const handlePrint = () => {
    if (!selectedViagem || boardingLocations.length === 0) {
      toast({ title: "Nada para Imprimir", description: "Selecione uma viagem e certifique-se de que há locais de embarque.", variant: "warning" });
      return;
    }
    setIsPrinting(true);
  };
  
  useEffect(() => {
    if (isPrinting && selectedViagem && printAreaTarget) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100); // Delay to allow content to render
      return () => clearTimeout(timer);
    }
  }, [isPrinting, selectedViagem, printAreaTarget, boardingLocations]);


  const handleClearTimes = () => {
    setBoardingLocations(prev => prev.map(loc => ({ ...loc, horario: '--:--' })));
    toast({ title: "Horários Limpos", description: "Clique em 'Salvar' para persistir as alterações." });
  };
  
  const handleSortByTime = () => {
    setBoardingLocations(prev => {
      return [...prev].sort((a, b) => {
        const timeA = a.horario === '--:--' || !/^\d{2}:\d{2}$/.test(a.horario) ? '99:99' : a.horario;
        const timeB = b.horario === '--:--' || !/^\d{2}:\d{2}$/.test(b.horario) ? '99:99' : b.horario;
        return timeA.localeCompare(timeB);
      });
    });
     toast({ title: "Ordenado por Horário", description: "Os locais foram reordenados pelo horário. Salve para manter a ordem." });
  };

  const dynamicTitle = selectedViagem ? `${selectedViagem.destino} - ${formatDateForDisplayDDMMYYYY(selectedViagem.datapartida)}` : "Selecione uma Viagem";

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="p-4 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Lista de Embarques</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">{dynamicTitle}</p>
        
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="w-full sm:w-auto sm:flex-grow max-w-md">
            <SelectField
              id="viagemFilter"
              name="viagemFilter"
              label=""
              value={selectedViagem?.value || ''}
              onChange={(e) => {
                const selected = viagemOptions.find(opt => opt.value === e.target.value);
                setSelectedViagem(selected || null);
              }}
              options={viagemOptions}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button onClick={handleSave} disabled={isSaving || !selectedViagem} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50 flex items-center">
              <Save size={16} className="mr-1.5" /> Salvar
            </button>
            <button onClick={handlePrint} disabled={!selectedViagem || boardingLocations.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 disabled:opacity-50 flex items-center">
              <Printer size={16} className="mr-1.5" /> Imprimir
            </button>
             <button onClick={handleSortByTime} disabled={!selectedViagem || boardingLocations.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 disabled:opacity-50 flex items-center">
              <ArrowDownUp size={16} className="mr-1.5" /> Ordenar
            </button>
            <button onClick={handleClearTimes} disabled={!selectedViagem || boardingLocations.length === 0} className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 disabled:opacity-50 flex items-center">
              <Trash2 size={16} className="mr-1.5" /> Limpar Horários
            </button>
          </div>
        </div>

        {selectedViagem && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md shadow mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2 text-green-600" />
            <p className="text-sm font-medium">Favor chegar nos pontos de embarque com 15 minutos de antecedência!</p>
          </div>
        )}

        {isLoading && <p className="text-center text-gray-600">Carregando...</p>}
        
        {!isLoading && selectedViagem && boardingLocations.length === 0 && (
          <p className="text-center text-gray-600 mt-6">Nenhum local de embarque encontrado para esta viagem ou nenhum passageiro cadastrado.</p>
        )}

        {!isLoading && boardingLocations.map((item, index) => (
          <DraggableCard key={item.id} index={index} item={item} moveCard={moveCard} onTimeChange={handleTimeChange} />
        ))}

        {selectedViagem && boardingLocations.length > 0 && (
             <div className="mt-6 text-center text-sm font-semibold text-blue-700 p-3 bg-blue-50 rounded-md shadow">
                <Bus size={18} className="inline mr-2" />
                A Santo Tour deseja a todos uma excelente viagem!
            </div>
        )}
      </div>
      {isPrinting && selectedViagem && printAreaTarget &&
        ReactDOM.createPortal(
          <PrintableListaEmbarque
            viagemNome={selectedViagem.destino}
            viagemData={formatDateForDisplayDDMMYYYY(selectedViagem.datapartida)}
            boardingLocations={boardingLocations}
          />,
          printAreaTarget
        )
      }
    </DndProvider>
  );
};
