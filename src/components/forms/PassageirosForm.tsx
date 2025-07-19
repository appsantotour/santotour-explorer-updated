
import React, { useState, useCallback, useEffect } from 'react';
import { PassageiroFormData, PassageiroFormFieldName } from '../../types';
import InputField from '../InputField';
import SelectField from '../SelectField';
import CheckboxField from '../CheckboxField';
import PassageiroPaymentSection from './sections/PassageiroPaymentSection'; // Updated import path
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { applyCpfMask, applyPhoneMask, formatNumberToBRLCurrency, parseBRLCurrency } from '@/utils/maskUtils';
import { formatDateForDisplayDDMMYYYY, convertDateToSupabaseFormat, convertDateFromSupabaseFormat, getTodayInSupabaseFormat } from '@/utils/dateUtils';
import { sanitizeFormData } from '@/utils/sanitizationUtils';


const initialFormData: PassageiroFormData = {
  id: undefined, // Will store ID of passageiro record if editing an existing one
  viagemId: '',
  nomeviagem: '', 
  datapartida: '', // Added for storing trip departure date
  nomepassageiro: '',
  cpfpassageiro: '',
  telefonepassageiro: '',
  bairropassageiro: '',
  cidadepassageiro: '',
  localembarquepassageiro: '',
  enderecoembarquepassageiro: '',
  cpfindicador: '',
  nomeindicador: '', // Changed from passageiroindicadopor to align with PassageiroFormData type
  elegiveldesconto: true,
  passageiroobservacao: '',
  valorviagem: '0,00',
  valorsinal: '',
  datasinal: '',
  valorparcela2: '',
  dataparcela2: '',
  observacoesparcela2: '',
  valorparcela3: '',
  dataparcela3: '',
  observacoesparcela3: '',
  valorparcela4: '',
  dataparcela4: '',
  observacoesparcela4: '',
  valorparcela5: '',
  dataparcela5: '',
  observacoesparcela5: '',
  valorparcela6: '',
  dataparcela6: '',
  observacoesparcela6: '',
  valorparcela7: '',
  dataparcela7: '',
  observacoesparcela7: '',
  valorparcela8: '',
  dataparcela8: '',
  observacoesparcela8: '',
  valorparcela9: '',
  dataparcela9: '',
  observacoesparcela9: '',
  valorparcela10: '',
  dataparcela10: '',
  observacoesparcela10: '',
  descontopromocional: '',
  descontoindicacoes: '0,00', // Initialize as "0,00"
  valorfaltareceber: '0,00',
};

const paymentFieldsKeys: PassageiroFormFieldName[] = [
    'valorsinal', 'datasinal',
    'valorparcela2', 'dataparcela2', 'observacoesparcela2',
    'valorparcela3', 'dataparcela3', 'observacoesparcela3',
    'valorparcela4', 'dataparcela4', 'observacoesparcela4',
    'valorparcela5', 'dataparcela5', 'observacoesparcela5',
    'valorparcela6', 'dataparcela6', 'observacoesparcela6',
    'valorparcela7', 'dataparcela7', 'observacoesparcela7',
    'valorparcela8', 'dataparcela8', 'observacoesparcela8',
    'valorparcela9', 'dataparcela9', 'observacoesparcela9',
    'valorparcela10', 'dataparcela10', 'observacoesparcela10',
    'descontopromocional',
    // descontoindicacoes handled separately for calculation logic
    'valorfaltareceber'
];


interface Option {
  value: string;
  label: string;
}

interface IndicatedPassengerDetail {
  nome: string;
  cpf: string;
  comissao: string;
}

const PassageirosForm: React.FC = () => {
  const [formData, setFormData] = useState<PassageiroFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viagemOptions, setViagemOptions] = useState<Option[]>([{ value: '', label: 'Selecione uma Viagem' }]);
  const [isLoadingViagens, setIsLoadingViagens] = useState(false);
  const [isLoadingCpfPassageiro, setIsLoadingCpfPassageiro] = useState(false);
  const [isLoadingCpfIndicador, setIsLoadingCpfIndicador] = useState(false);
  const [cpfindicadorError, setCpfindicadorError] = useState<string | null>(null);
  const [existingPassengerRecordId, setExistingPassengerRecordId] = useState<string | null>(null);
  const [isLoadingPassengerPayments, setIsLoadingPassengerPayments] = useState(false);
  const [currentTripCommissionRateFromViagens, setCurrentTripCommissionRateFromViagens] = useState<number | null>(null);
  // const [currentSelectedTripName, setCurrentSelectedTripName] = useState<string | null>(null); // No longer needed, use formData.nomeviagem
  // const [currentTripDepartureDate, setCurrentTripDepartureDate] = useState<string | null>(null); // No longer needed, use formData.datapartida
  const [indicatedPassengersDetails, setIndicatedPassengersDetails] = useState<IndicatedPassengerDetail[]>([]);
  const [showIndicatedDetails, setShowIndicatedDetails] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    const fetchViagens = async () => {
      setIsLoadingViagens(true);
      const today = getTodayInSupabaseFormat();
      const { data, error } = await supabase
        .from('viagens')
        .select('id, destino, datapartida')
        .gte('datapartida', today)
        .order('datapartida', { ascending: true });

      if (error) {
        toast({ title: "Erro ao buscar viagens", description: error.message, variant: "destructive" });
        setViagemOptions([{ value: '', label: 'Erro ao carregar' }]);
      } else {
        const options = data.map(v => ({
          value: v.id,
          label: `${v.destino || 'Viagem sem destino'} - ${formatDateForDisplayDDMMYYYY(v.datapartida) || 'Data indefinida'}`,
        }));
        setViagemOptions([{ value: '', label: 'Selecione uma Viagem' }, ...options]);
      }
      setIsLoadingViagens(false);
    };
    fetchViagens();
  }, [toast]);

  const resetPassengerDetailsAndPayments = (keepCpf = false, keepNome = false, keepViagem = false) => {
    setFormData(prev => {
        const newFormState: PassageiroFormData = {
            ...initialFormData,
            viagemId: keepViagem ? prev.viagemId : '',
            nomeviagem: keepViagem ? prev.nomeviagem : '', 
            datapartida: keepViagem ? prev.datapartida : '', // Reset datapartida if viagemId is reset
            cpfpassageiro: keepCpf ? prev.cpfpassageiro : '',
            nomepassageiro: keepNome ? prev.nomepassageiro : (keepCpf ? prev.nomepassageiro : ''),
            elegiveldesconto: typeof prev.elegiveldesconto === 'boolean' ? prev.elegiveldesconto : initialFormData.elegiveldesconto!,
        };
        return newFormState;
    });
    setExistingPassengerRecordId(null);
    setIndicatedPassengersDetails([]);
    setShowIndicatedDetails(false);
  };


  useEffect(() => {
    const unmaskedCpf = formData.cpfpassageiro.replace(/\D/g, '');
    const viagemIdToQuery = formData.viagemId;

    if (!viagemIdToQuery && unmaskedCpf.length === 0) {
      if(formData.valorviagem !== '0,00' || formData.descontoindicacoes !== '0,00' || formData.nomeviagem !== '' || formData.datapartida !== '') {
        setFormData(prev => ({...prev, valorviagem: '0,00', descontoindicacoes: '0,00', nomeviagem: '', datapartida: ''}));
      }
      setCurrentTripCommissionRateFromViagens(null);
      setIndicatedPassengersDetails([]);
      setShowIndicatedDetails(false);
    }

    if (!viagemIdToQuery || unmaskedCpf.length !== 11) {
      if (viagemIdToQuery && unmaskedCpf.length === 0 && (existingPassengerRecordId || formData.nomepassageiro !== '')) {
        resetPassengerDetailsAndPayments(false, false, true);
      }
      if (!viagemIdToQuery && (formData.valorviagem !== '0,00' || formData.descontoindicacoes !== '0,00' || formData.nomeviagem !== '' || formData.datapartida !== '')) {
        setFormData(prev => ({ ...prev, valorviagem: '0,00', descontoindicacoes: '0,00', nomeviagem: '', datapartida: '' }));
      }
      if (!viagemIdToQuery) {
        setCurrentTripCommissionRateFromViagens(null);
        setIndicatedPassengersDetails([]);
        setShowIndicatedDetails(false);
      }
      return;
    }

    const fetchAllPassengerData = async (cpfToQuery: string, currentViagemId: string) => {
        setIsLoadingCpfPassageiro(true);
        setIsLoadingPassengerPayments(true);
        setIndicatedPassengersDetails([]); 
        setShowIndicatedDetails(false);



        let finalUpdatedFields: Partial<PassageiroFormData> = {};
        let authoritativeTripPrice = '0,00';
        let tripCommissionRate: number | null = null;
        let tripName: string | null = null;
        let tripDepartureDate: string | null = null;

        if (currentViagemId) {
            const { data: viagemData, error: viagemError } = await supabase
                .from('viagens')
                .select('destino, precodefinido, comissaodivulgacaovalor, datapartida') 
                .eq('id', currentViagemId)
                .single();

            if (viagemError && viagemError.code !== 'PGRST116') {
                toast({ title: "Erro ao buscar detalhes da viagem", description: viagemError.message, variant: "destructive" });
            } else if (viagemData) {
                if (viagemData.precodefinido !== null && viagemData.precodefinido !== undefined) {
                    authoritativeTripPrice = formatNumberToBRLCurrency(Number(viagemData.precodefinido));
                }
                if (viagemData.comissaodivulgacaovalor !== null && viagemData.comissaodivulgacaovalor !== undefined) {
                    tripCommissionRate = Number(viagemData.comissaodivulgacaovalor);
                }
                tripName = viagemData.destino || null;
                if (viagemData.datapartida) {
                    tripDepartureDate = formatDateForDisplayDDMMYYYY(viagemData.datapartida);
                }
            }
        }
        finalUpdatedFields.valorviagem = authoritativeTripPrice;
        finalUpdatedFields.nomeviagem = tripName || ''; 
        finalUpdatedFields.datapartida = tripDepartureDate || '';
        setCurrentTripCommissionRateFromViagens(tripCommissionRate);

        let clientDataFound = false;
        try {
            const { data: clientData, error: clientError } = await supabase
                .from('clientes')
                .select('*')
                .eq('cpf', cpfToQuery)
                .single();
            if (clientError && clientError.code !== 'PGRST116') throw clientError;

            if (clientData) {
                clientDataFound = true;
                // Carrega apenas os campos especificados do cliente
                finalUpdatedFields = {
                    ...finalUpdatedFields,
                    nomepassageiro: clientData.nome || '',
                    telefonepassageiro: clientData.telefone ? applyPhoneMask(clientData.telefone) : '',
                    bairropassageiro: clientData.bairro || '',
                    cidadepassageiro: clientData.cidade || '',
                    localembarquepassageiro: clientData.localembarque || '',
                    enderecoembarquepassageiro: clientData.enderecoembarque || '',
                    cpfindicador: clientData.indicadopor ? applyCpfMask(clientData.indicadopor) : '',
                    nomeindicador: clientData.nomeindicadopor || '',
                };
            } else {
                finalUpdatedFields = {
                    ...finalUpdatedFields,
                    nomepassageiro: formData.cpfpassageiro === cpfToQuery ? formData.nomepassageiro : '',
                    telefonepassageiro: '', bairropassageiro: '', cidadepassageiro: '',
                    localembarquepassageiro: '', enderecoembarquepassageiro: '',
                    cpfindicador: '', nomeindicador: '',
                };
            }
        } catch (err: any) {
            toast({ title: "Erro Consulta Cliente", description: `Falha ao verificar CPF do cliente: ${err.message}`, variant: "destructive" });
            finalUpdatedFields = { ...finalUpdatedFields, nomepassageiro: formData.cpfpassageiro === cpfToQuery ? formData.nomepassageiro : '' };
            Object.keys(initialFormData).forEach(key => {
                const formKey = key as keyof PassageiroFormData;
                if (!['viagemId', 'cpfpassageiro', 'nomepassageiro', 'valorviagem', 'nomeviagem', 'datapartida', 'elegiveldesconto', 'descontoindicacoes'].includes(formKey) && !(formKey in finalUpdatedFields)) {
                    (finalUpdatedFields as any)[formKey] = initialFormData[formKey];
                }
            });
        } finally {
            setIsLoadingCpfPassageiro(false);
        }

        try {
            const { data: passengerData, error: passengerError } = await supabase
                .from('passageiros')
                .select('*')
                .eq('idviagem', currentViagemId)
                .eq('cpfpassageiro', cpfToQuery)
                .single();

            if (passengerError && passengerError.code !== 'PGRST116') throw passengerError;

            if (passengerData) {
                finalUpdatedFields = {
                    ...finalUpdatedFields,
                    id: passengerData.id,
                    // nomeviagem will be reconstructed on save, no need to load its old combined format
                    // datapartida will be reconstructed on save, no need to load its old display format
                    valorsinal: formatNumberToBRLCurrency(passengerData.valorsinal),
                    datasinal: convertDateFromSupabaseFormat(passengerData.datasinal),
                    valorparcela2: formatNumberToBRLCurrency(passengerData.valorparcela2), dataparcela2: convertDateFromSupabaseFormat(passengerData.dataparcela2), observacoesparcela2: passengerData.observacoesparcela2 || '',
                    valorparcela3: formatNumberToBRLCurrency(passengerData.valorparcela3), dataparcela3: convertDateFromSupabaseFormat(passengerData.dataparcela3), observacoesparcela3: passengerData.observacoesparcela3 || '',
                    valorparcela4: formatNumberToBRLCurrency(passengerData.valorparcela4), dataparcela4: convertDateFromSupabaseFormat(passengerData.dataparcela4), observacoesparcela4: passengerData.observacoesparcela4 || '',
                    valorparcela5: formatNumberToBRLCurrency(passengerData.valorparcela5), dataparcela5: convertDateFromSupabaseFormat(passengerData.dataparcela5), observacoesparcela5: passengerData.observacoesparcela5 || '',
                    valorparcela6: formatNumberToBRLCurrency(passengerData.valorparcela6), dataparcela6: convertDateFromSupabaseFormat(passengerData.dataparcela6), observacoesparcela6: passengerData.observacoesparcela6 || '',
                    valorparcela7: formatNumberToBRLCurrency(passengerData.valorparcela7), dataparcela7: convertDateFromSupabaseFormat(passengerData.dataparcela7), observacoesparcela7: passengerData.observacoesparcela7 || '',
                    valorparcela8: formatNumberToBRLCurrency(passengerData.valorparcela8), dataparcela8: convertDateFromSupabaseFormat(passengerData.dataparcela8), observacoesparcela8: passengerData.observacoesparcela8 || '',
                    valorparcela9: formatNumberToBRLCurrency(passengerData.valorparcela9), dataparcela9: convertDateFromSupabaseFormat(passengerData.dataparcela9), observacoesparcela9: passengerData.observacoesparcela9 || '',
                    valorparcela10: formatNumberToBRLCurrency(passengerData.valorparcela10), dataparcela10: convertDateFromSupabaseFormat(passengerData.dataparcela10), observacoesparcela10: passengerData.observacoesparcela10 || '',
                    descontopromocional: formatNumberToBRLCurrency(passengerData.descontopromocional),
                    valorfaltareceber: formatNumberToBRLCurrency(passengerData.valorfaltareceber),

                    nomepassageiro: passengerData.nomepassageiro || finalUpdatedFields.nomepassageiro || '',
                    telefonepassageiro: passengerData.telefonepassageiro ? applyPhoneMask(passengerData.telefonepassageiro) : finalUpdatedFields.telefonepassageiro || '',
                    bairropassageiro: passengerData.bairropassageiro || finalUpdatedFields.bairropassageiro || '',
                    cidadepassageiro: passengerData.cidadepassageiro || finalUpdatedFields.cidadepassageiro || '',
                    cpfindicador: finalUpdatedFields.cpfindicador || '',
                    nomeindicador: finalUpdatedFields.nomeindicador || '',
                    elegiveldesconto: typeof passengerData.elegiveldesconto === 'boolean' ? passengerData.elegiveldesconto : (typeof finalUpdatedFields.elegiveldesconto === 'boolean' ? finalUpdatedFields.elegiveldesconto : initialFormData.elegiveldesconto!),
                    passageiroobservacao: passengerData.passageiroobservacao || finalUpdatedFields.passageiroobservacao || '',
                };
                setExistingPassengerRecordId(passengerData.id);
                toast({ title: "Passageiro Encontrado na Viagem", description: "Dados pessoais e de pagamento carregados." });
            } else {
                paymentFieldsKeys.forEach(key => { (finalUpdatedFields as any)[key] = initialFormData[key]; });
                finalUpdatedFields.descontoindicacoes = '0,00';
                setExistingPassengerRecordId(null);
                if (clientDataFound) {
                  toast({ title: "Cliente Encontrado", description: "Dados pessoais carregados. Preencha os dados de pagamento para esta viagem." });
                } else {
                  toast({ title: "Passageiro Novo", description: "CPF não encontrado. Preencha todos os dados manualmente." });
                }
            }
        } catch (err: any) {
            toast({ title: "Erro Consulta Pagamentos", description: `Falha ao verificar pagamentos: ${err.message}`, variant: "destructive" });
             paymentFieldsKeys.forEach(key => { (finalUpdatedFields as any)[key] = initialFormData[key]; });
            finalUpdatedFields.descontoindicacoes = '0,00';
            setExistingPassengerRecordId(null);
        } finally {
            setIsLoadingPassengerPayments(false);
        }

        try {
            const { data: comissoesGanhasData, error: comissoesError } = await supabase
                .from('passageiros')
                .select('nomepassageiro, cpfpassageiro, comissaodivulgacaovalor')
                .eq('idviagem', currentViagemId)
                .eq('cpfindicador', cpfToQuery);

            if (comissoesError) {
                toast({ title: "Erro ao Calcular Desconto", description: `Falha ao buscar comissões ganhas: ${comissoesError.message}`, variant: "warning" });
                finalUpdatedFields.descontoindicacoes = '0,00';
                setIndicatedPassengersDetails([]);
            } else {
                const totalComissoesGanha = comissoesGanhasData?.reduce((sum, item) => sum + (Number(item.comissaodivulgacaovalor) || 0), 0) || 0;
                finalUpdatedFields.descontoindicacoes = formatNumberToBRLCurrency(totalComissoesGanha);

                if (comissoesGanhasData) {
                    const details: IndicatedPassengerDetail[] = comissoesGanhasData.map(item => ({
                        nome: item.nomepassageiro || 'Nome não encontrado',
                        cpf: item.cpfpassageiro ? applyCpfMask(item.cpfpassageiro) : 'CPF não encontrado',
                        comissao: formatNumberToBRLCurrency(Number(item.comissaodivulgacaovalor) || 0)
                    }));
                    setIndicatedPassengersDetails(details);
                } else {
                    setIndicatedPassengersDetails([]);
                }
            }
        } catch (err: any) {
            toast({ title: "Erro Cálculo Desconto", description: `Exceção ao calcular desconto por indicações.`, variant: "warning" });
            finalUpdatedFields.descontoindicacoes = '0,00';
            setIndicatedPassengersDetails([]);
        }

        setFormData(prev => {
            const stateToSet = { ...prev, ...finalUpdatedFields };
            if (finalUpdatedFields.elegiveldesconto === undefined) {
                const passengerDataElegivel = finalUpdatedFields.id ? (finalUpdatedFields as PassageiroFormData).elegiveldesconto : undefined;
                stateToSet.elegiveldesconto = typeof passengerDataElegivel === 'boolean' ? passengerDataElegivel : (clientDataFound ? false : initialFormData.elegiveldesconto!);
            }
            return stateToSet;
        });
    };

    const timer = setTimeout(() => {
        fetchAllPassengerData(unmaskedCpf, viagemIdToQuery!);
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.viagemId, formData.cpfpassageiro, toast]);


  useEffect(() => {
    const unmaskedIndicadorCpf = formData.cpfindicador?.replace(/\D/g, '') || '';
    if (!unmaskedIndicadorCpf || unmaskedIndicadorCpf.length !== 11) {
      setFormData(prev => ({ ...prev, nomeindicador: '' }));
      if (cpfindicadorError) setCpfindicadorError(null);
      return;
    }

    const fetchIndicadorData = async (cpf: string) => {
      setIsLoadingCpfIndicador(true);
      setCpfindicadorError(null);
      try {
        const { data, error } = await supabase.from('clientes').select('nome').eq('cpf', cpf).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setFormData(prev => ({ ...prev, nomeindicador: data.nome || '' }));
          toast({ title: "Indicador Encontrado", description: `Nome: ${data.nome}` });
        } else {
          setCpfindicadorError("Cadastre o indicador como cliente primeiro.");
          setFormData(prev => ({ ...prev, nomeindicador: '' }));
          toast({ title: "Indicador Não Encontrado", description: "CPF do indicador não encontrado.", variant: "warning" });
        }
      } catch (err: any) {
        setCpfindicadorError("Erro ao verificar CPF do indicador.");
        toast({ title: "Erro (Indicador)", description: "Falha ao verificar CPF do indicador.", variant: "destructive" });
        setFormData(prev => ({ ...prev, nomeindicador: '' }));
      } finally {
        setIsLoadingCpfIndicador(false);
      }
    };

    const timer = setTimeout(() => {
        fetchIndicadorData(unmaskedIndicadorCpf);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.cpfindicador, toast]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as PassageiroFormFieldName;

    setFormData(prev => {
        let newState = { ...prev, [fieldName]: value } as PassageiroFormData;

        if (fieldName === 'viagemId') {
            const currentCpf = newState.cpfpassageiro;
            const currentNome = newState.nomepassageiro;
            newState = {
                ...initialFormData,
                viagemId: value,
                cpfpassageiro: currentCpf,
                nomepassageiro: currentNome,
                nomeviagem: '', 
                datapartida: '', // Clear datapartida when trip changes
                elegiveldesconto: typeof prev.elegiveldesconto === 'boolean' ? prev.elegiveldesconto : initialFormData.elegiveldesconto!,
                descontoindicacoes: '0,00',
            };
            setExistingPassengerRecordId(null);
            setCurrentTripCommissionRateFromViagens(null);
            setIndicatedPassengersDetails([]);
            setShowIndicatedDetails(false);
        } else if (fieldName === 'cpfpassageiro') {
            const unmaskedCpf = value.replace(/\D/g, '');
            if ((unmaskedCpf.length < 11 || unmaskedCpf.length === 0) && existingPassengerRecordId) {
                 const currentViagem = newState.viagemId;
                 const currentNome = newState.nomepassageiro;
                 const currentNomeViagem = newState.nomeviagem; 
                 const currentDataPartida = newState.datapartida;
                 newState = {
                    ...initialFormData,
                    viagemId: currentViagem,
                    nomeviagem: currentNomeViagem,
                    datapartida: currentDataPartida,
                    cpfpassageiro: value,
                    nomepassageiro: currentNome,
                    elegiveldesconto: typeof prev.elegiveldesconto === 'boolean' ? prev.elegiveldesconto : initialFormData.elegiveldesconto!,
                    descontoindicacoes: '0,00',
                 };
                 setExistingPassengerRecordId(null);
                 setIndicatedPassengersDetails([]);
                 setShowIndicatedDetails(false);
            }
        }
        return newState;
    });
  }, [existingPassengerRecordId]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as PassageiroFormFieldName]: checked,
    }));
  }, []);

  useEffect(() => {
    const valorViagemNum = parseBRLCurrency(formData.valorviagem) || 0;
    const valorSinalNum = parseBRLCurrency(formData.valorsinal) || 0;
    const descPromocionalNum = parseBRLCurrency(formData.descontopromocional) || 0;
    const descIndicacoesNum = parseBRLCurrency(formData.descontoindicacoes) || 0;

    let totalParcelasPagas = 0;
    for (let i = 2; i <= 10; i++) {
      const valorParcelaKey = `valorparcela${i}` as keyof PassageiroFormData;
      totalParcelasPagas += parseBRLCurrency(String(formData[valorParcelaKey])) || 0;
    }

    const restante = valorViagemNum - valorSinalNum - totalParcelasPagas - descPromocionalNum - descIndicacoesNum;
    setFormData(prev => ({ ...prev, valorfaltareceber: formatNumberToBRLCurrency(restante) }));

  }, [
    formData.valorviagem, formData.valorsinal, formData.descontopromocional, formData.descontoindicacoes,
    formData.valorparcela2, formData.valorparcela3, formData.valorparcela4,
    formData.valorparcela5, formData.valorparcela6, formData.valorparcela7,
    formData.valorparcela8, formData.valorparcela9, formData.valorparcela10,
  ]);

  const validateForm = (): boolean => {
    if (!formData.viagemId) {
      toast({ title: "Campo Obrigatório", description: "Selecione uma Viagem.", variant: "warning" });
      return false;
    }
    if (!formData.nomeviagem) { 
        toast({ title: "Erro Interno", description: "Nome da viagem não carregado. Selecione a viagem novamente.", variant: "destructive" });
        return false;
    }
    if (!formData.datapartida) {
        toast({ title: "Erro Interno", description: "Data de partida da viagem não carregada. Selecione a viagem novamente.", variant: "destructive" });
        return false;
    }
    if (!formData.nomepassageiro.trim() || formData.nomepassageiro.length > 100) {
      toast({ title: "Campo Obrigatório", description: "Nome do passageiro é obrigatório (máx. 100 caracteres).", variant: "warning" });
      return false;
    }
    const unmaskedCpfPassageiro = formData.cpfpassageiro.replace(/\D/g, '');
    if (!unmaskedCpfPassageiro || unmaskedCpfPassageiro.length !== 11 ) {
      toast({ title: "Campo Obrigatório", description: "CPF do passageiro é obrigatório e deve ter 11 dígitos.", variant: "warning" });
      return false;
    }
    if (cpfindicadorError) {
        toast({ title: "CPF Indicador Inválido", description: cpfindicadorError, variant: "warning" });
        return false;
    }
    return true;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }


    setIsSubmitting(true);
    
    // Construct nomeviagem string: Destino - DD/MM/AAAA
    const nomeViagemCompleto = `${formData.nomeviagem} - ${formData.datapartida}`;

    const dataToSave: any = {
      idviagem: formData.viagemId || null,
      nomeviagem: nomeViagemCompleto, 
      datapartida: convertDateToSupabaseFormat(formData.datapartida),
      nomepassageiro: formData.nomepassageiro,
      cpfpassageiro: formData.cpfpassageiro.replace(/\D/g, ''),
      telefonepassageiro: formData.telefonepassageiro?.replace(/\D/g, '') || null,
      bairropassageiro: formData.bairropassageiro || null,
      cidadepassageiro: formData.cidadepassageiro || null,
      localembarquepassageiro: formData.localembarquepassageiro || null,
      enderecoembarquepassageiro: formData.enderecoembarquepassageiro || null,
      cpfindicador: formData.cpfindicador?.replace(/\D/g, '') || null,
      passageiroindicadopor: formData.nomeindicador || null, // Map nomeindicador to passageiroindicadopor
      comissaodivulgacaovalor: formData.cpfindicador?.replace(/\D/g, '') ? currentTripCommissionRateFromViagens : null,
      elegiveldesconto: formData.elegiveldesconto === true, 
      passageiroobservacao: formData.passageiroobservacao || null,
      valorviagem: parseBRLCurrency(formData.valorviagem),
      valorsinal: parseBRLCurrency(formData.valorsinal),
      datasinal: convertDateToSupabaseFormat(formData.datasinal),
      descontopromocional: parseBRLCurrency(formData.descontopromocional),
      descontoindicacoes: parseBRLCurrency(formData.descontoindicacoes),
      valorfaltareceber: parseBRLCurrency(formData.valorfaltareceber),
    };

    for (let i = 2; i <= 10; i++) {
      const valorKey = `valorparcela${i}` as keyof PassageiroFormData;
      const dataKey = `dataparcela${i}` as keyof PassageiroFormData;
      const obsKey = `observacoesparcela${i}` as keyof PassageiroFormData;

      dataToSave[`valorparcela${i}`] = parseBRLCurrency(String(formData[valorKey]));
      dataToSave[`dataparcela${i}`] = convertDateToSupabaseFormat(String(formData[dataKey]));
      dataToSave[`observacoesparcela${i}`] = formData[obsKey] || null;
    }

    console.log('[DEBUG] PassageirosForm - handleSubmit - Value of elegiveldesconto being sent:', dataToSave.elegiveldesconto, typeof dataToSave.elegiveldesconto);
    console.log('[DEBUG] PassageirosForm - handleSubmit - Full dataToSave payload:', JSON.stringify(dataToSave, null, 2));


    let error = null;
    let successMessage = "";

    // Sanitize dataToSave before sending to Supabase
    const sanitizedData = sanitizeFormData(dataToSave, ['idviagem', 'cpfpassageiro', 'telefonepassageiro', 'cpfindicador', 'elegiveldesconto', 'valorviagem', 'valorsinal', 'datasinal', 'descontopromocional', 'descontoindicacoes', 'valorfaltareceber', 'datapartida', 'comissaodivulgacaovalor', 'valorparcela2', 'valorparcela3', 'valorparcela4', 'valorparcela5', 'valorparcela6', 'valorparcela7', 'valorparcela8', 'valorparcela9', 'valorparcela10', 'dataparcela2', 'dataparcela3', 'dataparcela4', 'dataparcela5', 'dataparcela6', 'dataparcela7', 'dataparcela8', 'dataparcela9', 'dataparcela10']);

    if (existingPassengerRecordId) {
        const { error: updateError } = await supabase
            .from('passageiros')
            .update(sanitizedData)
            .eq('id', existingPassengerRecordId);
        error = updateError;
        successMessage = 'Dados do passageiro atualizados com sucesso!';
    } else {
        const { data: insertedData, error: insertError } = await supabase
            .from('passageiros')
            .insert([sanitizedData])
            .select()
            .single();
        error = insertError;
        if (!error && insertedData) {
            setExistingPassengerRecordId(insertedData.id);
            setFormData(prev => ({...prev, id: insertedData.id }));
            successMessage = 'Passageiro cadastrado com sucesso!';
        } else if (!error) {
             successMessage = 'Passageiro cadastrado, mas ID não retornado.';
        }
    }

    if (error) {
      toast({ title: `Erro ao ${existingPassengerRecordId ? 'Atualizar' : 'Salvar'}`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: successMessage });
      if (formData.viagemId && formData.cpfpassageiro.replace(/\D/g, '').length === 11) {
        const currentCpf = formData.cpfpassageiro;
        const currentViagemId = formData.viagemId;
        setFormData(prev => ({ ...prev, cpfpassageiro: '' }));
        setTimeout(() => {
            setFormData(prev => ({ ...prev, cpfpassageiro: currentCpf, viagemId: currentViagemId }));
        }, 0);
      }
    }
    setIsSubmitting(false);
  }, [formData, toast, cpfindicadorError, existingPassengerRecordId, currentTripCommissionRateFromViagens]);

  const handleDelete = async () => {
    if (!existingPassengerRecordId) {
        toast({ title: "Ação Inválida", description: "Nenhum passageiro selecionado para excluir.", variant: "warning" });
        return;
    }
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o passageiro ${formData.nomepassageiro} (CPF: ${formData.cpfpassageiro}) desta viagem? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('passageiros').delete().eq('id', existingPassengerRecordId);
    if (error) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Passageiro Excluído", description: `O passageiro ${formData.nomepassageiro} foi removido da viagem.` });
      setFormData(initialFormData);
      setExistingPassengerRecordId(null);
      setCurrentTripCommissionRateFromViagens(null);
      setIndicatedPassengersDetails([]);
      setShowIndicatedDetails(false);
    }
    setIsSubmitting(false);
  };


  const toggleShowIndicatedDetails = () => {
    setShowIndicatedDetails(prev => !prev);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            DADOS DO PASSAGEIRO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6 mb-6">
            <SelectField
              id="viagemId"
              name="viagemId"
              label="Viagem"
              value={formData.viagemId || ''}
              onChange={handleChange}
              options={isLoadingViagens ? [{value: '', label: 'Carregando...'}] : viagemOptions}
              required
              disabled={isLoadingViagens || isSubmitting}
              className="md:col-span-2"
            />
            <div className="md:col-span-1 relative">
                <InputField
                    id="cpfpassageiro"
                    name="cpfpassageiro"
                    label="CPF"
                    value={formData.cpfpassageiro}
                    onChange={handleChange}
                    required
                    maskType="cpf"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    disabled={isSubmitting}
                />
                {(isLoadingCpfPassageiro || isLoadingPassengerPayments) && <span className="absolute top-0 right-0 mt-1 mr-1 text-xs text-blue-500 animate-pulse">Verificando...</span>}
            </div>
            <InputField id="nomepassageiro" name="nomepassageiro" label="Nome Completo" value={formData.nomepassageiro} onChange={handleChange} required maxLength={100} placeholder="Nome do Passageiro" className="md:col-span-2" readOnly disabled={isSubmitting} />
            <InputField id="telefonepassageiro" name="telefonepassageiro" label="Telefone" value={formData.telefonepassageiro || ''} onChange={handleChange} maskType="phone" maxLength={15} placeholder="(00) 00000-0000" className="md:col-span-1" readOnly disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6 mb-6">
            <InputField id="cidadepassageiro" name="cidadepassageiro" label="Cidade" value={formData.cidadepassageiro || ''} onChange={handleChange} maxLength={100} placeholder="Cidade do Passageiro" className="md:col-span-1" readOnly disabled={isSubmitting}/>
            <InputField id="bairropassageiro" name="bairropassageiro" label="Bairro" value={formData.bairropassageiro || ''} onChange={handleChange} maxLength={100} placeholder="Bairro do Passageiro" className="md:col-span-1" readOnly disabled={isSubmitting}/>
            <InputField id="localembarquepassageiro" name="localembarquepassageiro" label="Local de Embarque" value={formData.localembarquepassageiro || ''} onChange={handleChange} maxLength={100} placeholder="Local de Embarque" className="md:col-span-2" readOnly disabled={isSubmitting}/>
            <InputField id="enderecoembarquepassageiro" name="enderecoembarquepassageiro" label="Endereço de Embarque" value={formData.enderecoembarquepassageiro || ''} onChange={handleChange} maxLength={150} placeholder="Endereço Completo" className="md:col-span-2" readOnly disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6 mb-6 items-center">
            <div className="md:col-span-2 relative">
                <InputField
                    id="cpfindicador"
                    name="cpfindicador"
                    label="CPF do Indicador"
                    value={formData.cpfindicador || ''}
                    onChange={handleChange}
                    maskType="cpf"
                    maxLength={14}
                    placeholder="CPF de quem indicou"
                    readOnly={true}
                    disabled={isSubmitting}
                />
                {isLoadingCpfIndicador && <span className="absolute top-0 right-0 mt-1 mr-1 text-xs text-blue-500 animate-pulse">Verificando...</span>}
                {cpfindicadorError && <p className="text-xs text-red-600 mt-1">{cpfindicadorError}</p>}
            </div>
            <InputField
                id="nomeindicador"
                name="nomeindicador"
                label="Nome do Indicador"
                value={formData.nomeindicador || ''}
                onChange={handleChange}
                maxLength={100}
                placeholder="Nome de quem indicou"
                className="md:col-span-3"
                readOnly={true}
                disabled={isSubmitting}
            />
            <CheckboxField id="elegiveldesconto" name="elegiveldesconto" label="Elegível Desconto?" checked={!!formData.elegiveldesconto} onChange={handleCheckboxChange} className="md:col-span-1 mt-6" disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
            <InputField id="passageiroobservacao" name="passageiroobservacao" label="Observações" value={formData.passageiroobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Observações sobre o passageiro" className="md:col-span-6" isTextArea={false} disabled={isSubmitting}/>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            DADOS DOS PAGAMENTOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4">
            <InputField
              id="valorviagem"
              name="valorviagem"
              label="Valor Viagem R$"
              type="text"
              maskType="currency"
              value={formData.valorviagem || '0,00'}
              onChange={handleChange}
              placeholder="0,00"
              className="md:col-span-1"
              readOnly={true}
              disabled={isSubmitting}
            />
            <InputField id="valorsinal" name="valorsinal" label="Sinal R$" type="text" maskType="currency" value={formData.valorsinal || ''} onChange={handleChange} placeholder="0,00" className="md:col-span-1" disabled={isSubmitting}/>
            <InputField
              id="datasinal"
              name="datasinal"
              label="Data Sinal"
              type="text"
              maskType="date"
              placeholder="DD/MM/AAAA"
              value={formData.datasinal || ''}
              onChange={handleChange}
              className="md:col-span-1"
              disabled={isSubmitting}
            />
            <InputField id="descontopromocional" name="descontopromocional" label="Desc. Promocional R$" type="text" maskType="currency" value={formData.descontopromocional || ''} onChange={handleChange} placeholder="0,00" className="md:col-span-1" disabled={isSubmitting}/>
            <InputField
                id="descontoindicacoes"
                name="descontoindicacoes"
                label="Desc. Indicações R$"
                type="text"
                maskType="currency"
                value={formData.descontoindicacoes || '0,00'}
                onChange={handleChange}
                placeholder="0,00"
                className="md:col-span-1"
                readOnly={true}
                disabled={isSubmitting}
            />
            <InputField id="valorfaltareceber" name="valorfaltareceber" label="Valor Restante R$" type="text" maskType="currency" value={formData.valorfaltareceber || '0,00'} onChange={handleChange} readOnly placeholder="0,00" className="md:col-span-1" />

            {/* Nova linha para detalhes da comissão */}
            <div className="md:col-span-6 mt-1 mb-3">
              {indicatedPassengersDetails.length > 0 && (
                <button
                  type="button"
                  onClick={toggleShowIndicatedDetails}
                  className="text-xs text-blue-600 hover:text-blue-800 underline focus:outline-none mb-2"
                >
                  {showIndicatedDetails ? "Ocultar Detalhes das Indicações" : "Visualizar Detalhes das Indicações?"}
                </button>
              )}

              {showIndicatedDetails && indicatedPassengersDetails.length > 0 && (
                <div className="text-xs text-gray-600 space-y-0.5">
                  <h4 className="font-semibold mb-0.5">Indicados que geraram este desconto:</h4>
                  <ul className="list-none pl-0">
                    {indicatedPassengersDetails.map((indicado, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{indicado.nome} (CPF: {indicado.cpf})</span>
                        <span className="font-medium">R$ {indicado.comissao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!isLoadingCpfPassageiro && !isLoadingPassengerPayments &&
               formData.viagemId && formData.cpfpassageiro.replace(/\D/g, '').length === 11 &&
               indicatedPassengersDetails.length === 0 && (
                <p className="text-xs text-gray-500">Nenhuma comissão por indicação registrada para este passageiro nesta viagem.</p>
              )}
            </div>
          </div>

          <PassageiroPaymentSection formData={formData} handleChange={handleChange} />
        </div>
  <div className="flex flex-wrap justify-end pt-4 border-t mt-6 gap-2">
  <div className="mb-2 mr-0 md:mr-3">
    <button
      type="button"
      onClick={handleDelete}
      disabled={isSubmitting || !existingPassengerRecordId}
      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-100 disabled:cursor-not-allowed"
    >
      Excluir
    </button>
  </div>
  <div className="mb-2">
    <button
      type="submit"
      disabled={isSubmitting || isLoadingViagens || isLoadingCpfPassageiro || isLoadingCpfIndicador || isLoadingPassengerPayments}
      className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? 'Salvando...' : (existingPassengerRecordId ? 'Atualizar' : 'Salvar')}
    </button>
  </div>
        </div>
      </form>
    </div>
  );
};

export default PassageirosForm;
