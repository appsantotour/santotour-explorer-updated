import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import SelectField from '../SelectField';
import InputField from '../InputField';
import { ViagensFormData, PassageiroFormData } from '../../types';
import { formatDateForDisplayDDMMYYYY } from '../../utils/dateUtils';
import { applyCpfMask } from '../../utils/maskUtils';
import logoSrc from '../media/santo_tour_logo.png';
import { Loader2, Download, Image as ImageIcon, Trash2, User } from 'lucide-react';

interface ViagemOption {
  value: string;
  label: string;
}

interface HorarioEmbarqueInfo {
  localembarque: string;
  horario: string | null; // HH:MM
  enderecoembarque: string | null;
  horarioida?: string | null; // HH:MM
  horariovolta?: string | null; // HH:MM
  linkimagem?: string | null;
  guiaresponsavel?: string | null;
}

const VoucherGenerator: React.FC = () => {
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tripOptions, setTripOptions] = useState<ViagemOption[]>([]);
  const [tripDetails, setTripDetails] = useState<ViagensFormData | null>(null);
  const [passengers, setPassengers] = useState<PassageiroFormData[]>([]);
  const [tripBoardingSchedules, setTripBoardingSchedules] = useState<HorarioEmbarqueInfo[]>([]);
  
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>(''); // State for individual passenger selection
  
  const [voucherImageUrl, setVoucherImageUrl] = useState<string>('');
  
  const [editableHorarioIda, setEditableHorarioIda] = useState<string>('');
  const [editableHorarioVolta, setEditableHorarioVolta] = useState<string>('');
  const [editableNomeGuia, setEditableNomeGuia] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setImageLoaded(false); // Reseta quando a URL muda
  }, [voucherImageUrl]);
  const { toast } = useToast();
  const voucherRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      // Remove Supabase configuration check since it's always configured
      setIsLoading(true);
      const { data, error } = await supabase
        .from('viagens')
        .select('id, destino, datapartida')
        .order('datapartida', { ascending: false });

      if (error) {
        toast({ title: "Erro ao buscar viagens", description: error.message, variant: "destructive" });
      } else {
        const options = data.map(v => ({
          value: v.id,
          label: `${v.destino || 'Viagem s/ Destino'} - ${formatDateForDisplayDDMMYYYY(v.datapartida) || 'Data Indef.'}`,
        }));
        setTripOptions([{ value: '', label: 'Selecione uma Viagem' }, ...options]);
      }
      setIsLoading(false);
    };
    fetchTrips();
  }, [toast]);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!selectedTripId) {
        setTripDetails(null);
        setPassengers([]);
        setSelectedPassengerId('');
        setTripBoardingSchedules([]);
        setEditableHorarioIda('');
        setEditableHorarioVolta('');
        setEditableNomeGuia('');
        setVoucherImageUrl('');
        return;
      }
      setIsLoading(true);
      setSelectedPassengerId(''); // Reset passenger selection on trip change

      const { data: tripData, error: tripError } = await supabase
        .from('viagens')
        .select('*')
        .eq('id', selectedTripId)
        .single();

      if (tripError || !tripData) {
        toast({ title: "Erro ao buscar detalhes da viagem", description: tripError?.message || "Viagem não encontrada", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      setTripDetails(tripData as any);
      
      let guiaFinal = tripData.nomeguia || '';

      const { data: passengersData, error: passengersError } = await supabase
        .from('passageiros')
        .select('*')
        .eq('idviagem', selectedTripId)
        .order('nomepassageiro');
      
      if (passengersError) {
        toast({ title: "Erro ao buscar passageiros", description: passengersError.message, variant: "destructive" });
        setPassengers([]);
      } else {
        setPassengers(passengersData as any);
        voucherRefs.current = passengersData.map(() => null);
      }

      const { data: horariosData, error: horariosError } = await supabase
        .from('horariosembarques')
        .select('localembarque, horario, enderecoembarque, horarioida, horariovolta, linkimagem, guiaresponsavel')
        .eq('idviagem', selectedTripId);

      if (horariosError) {
        toast({ title: "Erro ao buscar horários de embarque", description: horariosError.message, variant: "warning" });
        setTripBoardingSchedules([]);
        const firstPassengerSchedule = '';
        setEditableHorarioIda(firstPassengerSchedule || (tripData.datapartida ? '00:00' : ''));
        setEditableHorarioVolta('');
        setVoucherImageUrl('');
      } else {
        setTripBoardingSchedules(horariosData || []);
        if (horariosData && horariosData.length > 0) {
          const firstSchedule = horariosData[0];
          setEditableHorarioIda(firstSchedule.horarioida?.substring(0,5) || firstSchedule.horario?.substring(0,5) || '');
          setEditableHorarioVolta(firstSchedule.horariovolta?.substring(0,5) || '');
          setVoucherImageUrl(firstSchedule.linkimagem || '');
          if (firstSchedule.guiaresponsavel) {
            guiaFinal = firstSchedule.guiaresponsavel;
          }
        } else {
           const firstPassengerSchedule = '';
           setEditableHorarioIda(firstPassengerSchedule || (tripData.datapartida ? '00:00' : ''));
           setEditableHorarioVolta('');
           setVoucherImageUrl('');
        }
      }
      setEditableNomeGuia(guiaFinal);
      setIsLoading(false);
    };
    fetchTripData();
  }, [selectedTripId, toast]);

  const saveTripData = async (): Promise<boolean> => {
    if (!selectedTripId) return false;

    const uniqueLocalEmbarquesSet = new Set(passengers.map(p => p.localembarquepassageiro).filter(Boolean) as string[]);
    const uniqueLocalEmbarques = Array.from(uniqueLocalEmbarquesSet);
    
    const upsertData = uniqueLocalEmbarques.map(local => {
        const scheduleInfo = tripBoardingSchedules.find(s => s.localembarque === local);
        const passengerForAddress = passengers.find(p => p.localembarquepassageiro === local);
        
        let horarioParaSalvar = scheduleInfo?.horario || '00:00:00';
        if (horarioParaSalvar === '--:--' || !horarioParaSalvar.match(/^\d{2}:\d{2}$/)) {
            horarioParaSalvar = editableHorarioIda && editableHorarioIda.match(/^\d{2}:\d{2}$/) 
                                ? `${editableHorarioIda}:00` 
                                : '00:00:00';
        } else {
            horarioParaSalvar = `${horarioParaSalvar}:00`;
        }
    
        return {
          idviagem: selectedTripId,
          localembarque: local,
          horario: horarioParaSalvar,
          enderecoembarque: scheduleInfo?.enderecoembarque || passengerForAddress?.enderecoembarquepassageiro || null,
          horarioida: editableHorarioIda ? `${editableHorarioIda.substring(0,5)}:00` : null,
          horariovolta: editableHorarioVolta ? `${editableHorarioVolta.substring(0,5)}:00` : null,
          linkimagem: voucherImageUrl || null,
          guiaresponsavel: editableNomeGuia || null,
          viagem: `${tripDetails?.destino} - ${formatDateForDisplayDDMMYYYY(tripDetails?.datapartida)}`
        };
      });

    if (upsertData.length > 0) {
      const { error: upsertError } = await supabase
        .from('horariosembarques')
        .upsert(upsertData, { onConflict: 'idviagem,localembarque' });

      if (upsertError) {
        toast({ title: "Erro ao Salvar Dados de Embarque", description: `Não foi possível salvar os dados: ${upsertError.message}`, variant: "destructive" });
        return false;
      }
      toast({ title: "Dados Salvos", description: "Informações de embarque e guia atualizadas.", variant: "default"});
    }
    return true;
  };

  // Função auxiliar para carregar imagem e converter para base64
  const loadImageAsDataURL = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Erro ao criar contexto do canvas'));
        }
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = url;
    });
  };

  const handleGenerateClick = async (mode: 'all' | 'individual') => {
    if (!tripDetails || passengers.length === 0) {
      toast({ title: "Dados Incompletos", description: "Selecione uma viagem com passageiros.", variant: "warning" });
      return;
    }
    if (mode === 'individual' && !selectedPassengerId) {
      toast({ title: "Passageiro não selecionado", description: "Selecione um passageiro para gerar o voucher individual.", variant: "warning" });
      return;
    }

    setIsGenerating(true);

    const saveDataSuccess = await saveTripData();
    if (!saveDataSuccess) {
      setIsGenerating(false);
      return;
    }

    const passengersToPrint = mode === 'individual'
      ? passengers.filter(p => p.id === selectedPassengerId)
      : passengers;

    if (passengersToPrint.length === 0) {
        toast({ title: "Nenhum passageiro encontrado", description: "O passageiro selecionado não foi encontrado na lista atual.", variant: "warning" });
        setIsGenerating(false);
        return;
    }

    // Pré-carregar a imagem se houver URL
    let imageDataURL: string | null = null;
    if (voucherImageUrl) {
      try {
        imageDataURL = await loadImageAsDataURL(voucherImageUrl);
      } catch (error) {
        console.error('Erro ao carregar imagem para o PDF:', error);
        toast({ title: "Aviso", description: "Erro ao carregar imagem. Gerando voucher sem a imagem.", variant: "warning" });
      }
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < passengersToPrint.length; i++) {
      const passenger = passengersToPrint[i];
      const originalIndex = passengers.findIndex(p => p.id === passenger.id);
      const voucherElement = voucherRefs.current[originalIndex];

      if (voucherElement) {
        try {
          const originalDisplay = voucherElement.style.display;
          voucherElement.style.display = 'flex'; 

          // Substituir a imagem externa por uma versão em base64 se disponível
          const imgElements = voucherElement.querySelectorAll('img[src^="http"]');
          const originalSrcs: string[] = [];
          
          if (imageDataURL && imgElements.length > 0) {
            imgElements.forEach((img, index) => {
              if (img instanceof HTMLImageElement && img.src === voucherImageUrl) {
                originalSrcs[index] = img.src;
                img.src = imageDataURL;
              }
            });
          }

          const canvas = await html2canvas(voucherElement, { 
            scale: 3, 
            useCORS: true, 
            allowTaint: true,
            logging: false,
            width: voucherElement.offsetWidth, 
            height: voucherElement.offsetHeight, 
            windowWidth: voucherElement.scrollWidth, 
            windowHeight: voucherElement.scrollHeight,
          });

          // Restaurar as URLs originais
          if (imageDataURL && imgElements.length > 0) {
            imgElements.forEach((img, index) => {
              if (img instanceof HTMLImageElement && originalSrcs[index]) {
                img.src = originalSrcs[index];
              }
            });
          }

          voucherElement.style.display = originalDisplay; 

          const imgData = canvas.toDataURL('image/png', 1.0);
          
          if (i > 0) {
            pdf.addPage('a4', 'p');
          }
          const imgProps = pdf.getImageProperties(imgData);
          const aspectRatio = imgProps.width / imgProps.height;
          
          let newWidth = pdfWidth - 4; 
          let newHeight = newWidth / aspectRatio;

          if (newHeight > pdfHeight - 4) { 
            newHeight = pdfHeight - 4;
            newWidth = newHeight * aspectRatio;
          }
          
          const x = (pdfWidth - newWidth) / 2;
          const y = (pdfHeight - newHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);

        } catch (error: any) {
          console.error("Error generating canvas/PDF for voucher:", error.message, error.stack);
          toast({ title: "Erro no Voucher", description: `Falha ao gerar voucher para ${passenger.nomepassageiro}. Detalhe: ${error.message}`, variant: "destructive" });
        }
      }
    }
    const fileName = mode === 'individual' && passengersToPrint.length === 1 
      ? `voucher_${passengersToPrint[0].nomepassageiro.split(' ')[0]}_${tripDetails.destino.replace(/\s+/g, '_')}.pdf`
      : `vouchers-${tripDetails.destino.replace(/\s+/g, '_')}-${Date.now()}.pdf`;

    pdf.save(fileName);
    setIsGenerating(false);
  };
  
  const validateImageUrl = async (url: string) => {
    if (!url) {
      setImageError(null);
      toast({ title: "URL Vazia", description: "Por favor, insira uma URL de imagem.", variant: "warning" });
      return;
    }

    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL fornecida não é uma imagem válida');
      }
      setImageError(null);
      toast({ title: "URL Válida", description: "A imagem foi validada com sucesso!", variant: "default" });
    } catch (error) {
      console.error('Erro ao validar imagem:', error);
      const errorMessage = 'URL inválida ou imagem inacessível. Verifique se o link está correto.';
      setImageError(errorMessage);
      toast({ title: "URL Inválida", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDeleteVoucherData = async () => {
    if (!selectedTripId) {
      toast({ title: "Nenhuma Viagem Selecionada", description: "Selecione uma viagem para excluir os dados.", variant: "warning"});
      return;
    }
    const confirmDelete = window.confirm("Tem certeza que deseja EXCLUIR TODOS OS DADOS DE EMBARQUE (horários, locais, etc.) para esta viagem? Esta ação é irreversível.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    // Remove Supabase configuration check since it's always configured
    {
      const { error } = await supabase
        .from('horariosembarques')
        .delete()
        .eq('idviagem', selectedTripId);

      if (error) {
        toast({ title: "Erro ao Excluir Dados", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Dados Excluídos", description: "Todos os dados de embarque para esta viagem foram removidos.", variant: "default" });
        setEditableHorarioIda(tripDetails?.datapartida ? '00:00' : '');
        setEditableHorarioVolta('');
        setVoucherImageUrl('');
        setEditableNomeGuia(tripDetails?.nomeguia || '');
        setTripBoardingSchedules([]); // Clear local state
      }
    }
    setIsDeleting(false);
  };

  const passengerOptions = passengers.map(p => ({ value: p.id!, label: p.nomepassageiro }));
  
  return (
    <div className="p-4 md:p-6 bg-gray-100">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <SelectField
            id="tripSelectVoucher"
            name="tripSelectVoucher"
            label="Selecione a Viagem"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            options={tripOptions}
            disabled={isLoading || isGenerating || isDeleting}
          />
           <SelectField
            id="passengerSelectVoucher"
            name="passengerSelectVoucher"
            label="Selecione o Passageiro (para voucher individual)"
            value={selectedPassengerId}
            onChange={(e) => setSelectedPassengerId(e.target.value)}
            options={[{value: '', label: 'Selecione um passageiro'}, ...passengerOptions]}
            disabled={!selectedTripId || passengers.length === 0 || isLoading || isGenerating || isDeleting}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-4 items-end">
            <div className="relative">
              <InputField
                  id="voucherImageUrl"
                  name="voucherImageUrl"
                  label="Link da Imagem"
                  value={voucherImageUrl}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setVoucherImageUrl(newUrl);
                    setImageError(null);
                  }}
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={isLoading || isGenerating || isDeleting}
                  error={imageError}
              />
              <button
                onClick={() => validateImageUrl(voucherImageUrl)}
                disabled={!voucherImageUrl || isLoading || isGenerating || isDeleting}
                className="absolute right-2 top-8 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Testar URL
              </button>
            </div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-end">
            <InputField
                id="editableHorarioIda"
                name="editableHorarioIda"
                label="Horário Ida"
                value={editableHorarioIda}
                onChange={(e) => setEditableHorarioIda(e.target.value)}
                placeholder="HH:MM"
                maxLength={5}
                disabled={isLoading || isGenerating || isDeleting}
            />
            <InputField
                id="editableHorarioVolta"
                name="editableHorarioVolta"
                label="Horário Volta"
                value={editableHorarioVolta}
                onChange={(e) => setEditableHorarioVolta(e.target.value)}
                placeholder="HH:MM"
                maxLength={5}
                disabled={isLoading || isGenerating || isDeleting}
            />
            <InputField
                id="editableNomeGuia"
                name="editableNomeGuia"
                label="Guia Responsável"
                value={editableNomeGuia}
                onChange={(e) => setEditableNomeGuia(e.target.value)}
                placeholder="Nome do Guia"
                disabled={isLoading || isGenerating || isDeleting}
            />
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={handleDeleteVoucherData}
            disabled={isLoading || isGenerating || isDeleting || !selectedTripId}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 flex items-center"
          >
            {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2" />}
            {isDeleting ? 'Excluindo...' : 'Excluir Dados Voucher'}
          </button>
          <button
            onClick={() => handleGenerateClick('individual')}
            disabled={isLoading || isGenerating || isDeleting || !selectedTripId || passengers.length === 0 || !selectedPassengerId}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 flex items-center"
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <User className="mr-2" />}
            {isGenerating ? 'Gerando...' : 'Gerar Voucher Individual'}
          </button>
          <button
            onClick={() => handleGenerateClick('all')}
            disabled={isLoading || isGenerating || isDeleting || !selectedTripId || passengers.length === 0}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 flex items-center"
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
            {isGenerating ? 'Gerando...' : 'Gerar Todos os Vouchers'}
          </button>
        </div>
      </div>

      {isLoading && selectedTripId && <div className="text-center py-4"><Loader2 className="animate-spin inline-block mr-2" /> Carregando passageiros...</div>}

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {passengers.map((passenger, index) => {
          const voucherNumber = passenger.poltrona ? String(passenger.poltrona).padStart(3, '0') : 'S/N';
          
          const passengerBoardingSchedule = tripBoardingSchedules.find(
            (schedule) => schedule.localembarque === passenger.localembarquepassageiro
          );

          let passengerBoardingTime = editableHorarioIda || 'A definir';
          if (passengerBoardingSchedule?.horario && passengerBoardingSchedule.horario !== '--:--') {
            passengerBoardingTime = passengerBoardingSchedule.horario.substring(0,5);
          }
          
          const passengerBoardingAddress = passengerBoardingSchedule?.enderecoembarque || passenger.enderecoembarquepassageiro || 'A definir';


          const voucherStyle: React.CSSProperties = { 
            width: '210mm',
            height: '297mm',
            boxSizing: 'border-box', 
            display: 'flex', 
            flexDirection: 'column', 
            fontFamily: '"Open Sans", sans-serif',
            border: '1px solid #cbd5e0', 
            padding: '2mm' 
          };
          
          const sectionBaseStyle = 'border border-gray-500 p-0.5'; 

          return (
          <div 
            key={passenger.id} 
            ref={el => { voucherRefs.current[index] = el; }}
            className="bg-white voucher-print-override" 
            style={voucherStyle}
          >
            {/* Seção 1 */}
            <div className={`flex items-center ${sectionBaseStyle}`} style={{ flexGrow: 2, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="w-1/5 flex items-center justify-center" style={{ paddingRight: '2px'}}>
                <img src={logoSrc} alt="Santo Tour Logo" style={{ height: '130px', margin: 'auto' }} />
              </div>
              <div className="w-4/5 pl-1 flex flex-col justify-center" style={{textAlign: 'center'}}>
                <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '40px', margin: 0, lineHeight: '1.1' }}>Santo Tour Viagens</p>
                <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '48px', margin: 0, lineHeight: '1.1', fontWeight: 'bold' }}>VOUCHER nº {voucherNumber}</p>
              </div>
            </div>
            
            {/* Seção 2 */}
            <div className={`text-left ${sectionBaseStyle}`} style={{ flexGrow: 2, padding: '2px' }}>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '30px', margin: 0, marginLeft: '4px', fontWeight: 'bold', lineHeight: '1.6' }}>Viagem: {tripDetails?.destino}</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>Data de Ida: {formatDateForDisplayDDMMYYYY(tripDetails?.datapartida)} - {editableHorarioIda || 'A definir'}</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>Data de Volta: {formatDateForDisplayDDMMYYYY(tripDetails?.dataretorno)} - {editableHorarioVolta || 'A definir'}</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>Embarque: {passenger.localembarquepassageiro || 'A definir'} : {passengerBoardingTime}</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>Endereço de Embarque: {passengerBoardingAddress}</p>
            </div>

            {/* Seção 3 (Guia Responsável) */}
            <div className={`text-left ${sectionBaseStyle}`} style={{ flexGrow: 1, padding: '2px' }}>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.2' }}>Guia Responsável: {editableNomeGuia || 'A definir'}</p>
            </div>

            {/* Seção 4 (Detalhes da Reserva) */}
            <div className={`text-left ${sectionBaseStyle}`} style={{ flexGrow: 2, padding: '2px' }}>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>Reserva em nome de:</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '30px', margin: 0, marginLeft: '4px', fontWeight: 'bold', lineHeight: '1.6' }}>{passenger.nomepassageiro}</p>
              <p style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '22px', margin: 0, marginLeft: '4px', lineHeight: '1.6' }}>CPF nº: {applyCpfMask(passenger.cpfpassageiro)}</p>
            </div>
            
{/* Seção 5 (Poltrona e Imagem) */}
<div className={`flex items-stretch ${sectionBaseStyle}`} style={{ 
  flexGrow: 4, 
  padding: '2px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  backgroundColor: '#ffffff' // Fundo branco garantido
}}>
  <div className="w-1/3 border-r border-gray-500 flex flex-col items-center justify-center text-center" style={{ padding: '2px' }}> 
    <span style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '32px', lineHeight: '1', marginTop: '8px' }}>Poltrona nº</span>
    <span style={{ fontFamily: '"Open Sans", sans-serif', fontSize: '144px', fontWeight: 'bold', lineHeight: '1' }}>{passenger.poltrona || 'S/N'}</span>
  </div>
  <div className="w-2/3 flex items-center justify-center relative" style={{ 
    overflow: 'hidden', 
    padding: '2px',
    minHeight: '200px', // Altura mínima garantida
    backgroundColor: '#ffffff' // Fundo branco
  }}>
    {voucherImageUrl ? (
      <>
        <img 
          src={voucherImageUrl}
          alt="Destino"
          style={{ 
            width: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            display: imageLoaded ? 'block' : 'none',
            visibility: 'visible',
            opacity: 1,
            position: 'relative'
          }}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      </>
    ) : (
      <div className="text-gray-400 text-center p-4 border-2 border-dashed rounded-lg w-full h-full flex flex-col items-center justify-center">
        <ImageIcon size={48} className="mx-auto mb-2" />
        <span>Imagem do Destino (Opcional)</span>
      </div>
    )}
  </div>
</div>
            
            {/* Seção 6 (Rodapé - Observações) */}
            <div 
              className={`${sectionBaseStyle}`} 
              style={{ 
                flexGrow: 1, 
                padding: '2px', 
                fontFamily: '"Open Sans", sans-serif', 
                fontSize: '18px', 
                lineHeight: '1.6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <p style={{margin: 0, textAlign: 'center' }}>* Comparecer no ponto de embarque com 15 minutos de antecedência</p>
              <p style={{margin: 0, textAlign: 'center', fontWeight: 'bold' }}>** BOA VIAGEM! **</p>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default VoucherGenerator;