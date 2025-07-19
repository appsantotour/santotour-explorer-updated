
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViagensFormData, ViagensFormFieldName } from '../../types';
import { supabase } from '../../integrations/supabase/client'; 
import { useToast } from '../../hooks/use-toast'; 
import { applyPhoneMask, formatNumberToBRLCurrency, parseBRLCurrency } from '../../utils/maskUtils'; 
import { convertDateFromSupabaseFormat, parseUIDateToDate, convertDateToSupabaseFormat } from '../../utils/dateUtils';
import { sanitizeFormData } from '../../utils/sanitizationUtils';

import InformacoesGeraisSection from './sections/InformacoesGeraisSection';
import TaxasSection from './sections/TaxasSection';
import TransporteSection from './sections/TransporteSection';
import MotoristasSection from './sections/MotoristasSection';
import TrasladosSection from './sections/TrasladosSection';
import HospedagemSection from './sections/HospedagemSection';
import PasseiosIngressosSection from './sections/PasseiosIngressosSection';
import BrindesExtrasSection from './sections/BrindesExtrasSection';
import SorteiosSection from './sections/SorteiosSection';
import OutrasDespesasSection from './sections/OutrasDespesasSection';
import OutrasReceitasSection from './sections/OutrasReceitasSection';
import ResultadosEstimativaSection from './sections/ResultadosEstimativaSection';
import ResultadosRealSection from './sections/ResultadosRealSection';


interface Option {
  value: string;
  label: string;
}

const initialViagensFormData: ViagensFormData = {
  id: undefined,
  destino: '',
  cidadesvisitar: '',
  datapartida: '',
  dataretorno: '',
  // TAXAS
  taxacidade: '',
  outrastaxasvalor: '',
  estacionamento: '',
  taxaguialocal: '',
  nomeguia: '',
  whatsappguia: '',
  nomeguialocal: '',
  whatsappguialocal: '',
  totaldespesastaxas: '0,00',
  adiantamentotaxas: '',
  taxasobservacao: '',
  // TRANSPORTE
  cidadetransporte: '',
  empresatransporte: '', 
  contatotransporte: '', 
  whatsapptransporte: '', 
  tipoveiculo: '', 
  qtdeassentos: '0', 
  qtdereservadosguias: '1',
  qtdepromocionais: '0', 
  naovendidos: '0', 
  qtdenaopagantes: '0',
  qtdepagantes: '0', 
  frete: '',
  adiantamentotransporte: '',
  transporteobservacao: '',
  // Seção MOTORISTAS
  qtdemotoristas: '0', 
  qtdealmocosmotoristas: '0',
  qtdejantasmotoristas: '0',
  refeicaomotoristaunitario: '',
  totalrefeicaomotorista: '0,00',
  qtdedeslocamentosmotoristas: '0',
  deslocamentomotoristaunitario: '',
  totaldeslocamentosmotoristas: '0,00',
  totaldespesasmotoristas: '0,00', 
  adiantamentomotoristas: '',
  motoristasobservacao: '',
  // Seção TRASLADOS
  qtdetraslado1: '0',
  traslado1valor: '',
  traslado1descricao: '',
  qtdetraslado2: '0',
  traslado2valor: '',
  traslado2descricao: '',
  qtdetraslado3: '0',
  traslado3valor: '',
  traslado3descricao: '',
  totaldespesastraslados: '0,00', 
  adiantamentotraslados: '',
  trasladosobservacao: '',
  // Seção HOSPEDAGEM
  cidadehospedagem: '',
  empresahospedagem: '', 
  tipohospedagem: '', 
  regimehospedagem: '', 
  contatohospedagem: '',
  whatsapphospedagem: '', 
  qtdehospedes: '0', 
  qtdediarias: '0', 
  valordiariaunitario: '', 
  totaldiarias: '0,00', 
  outrosservicosvalor: '',
  outrosservicosdescricao: '',
  totaldespesashospedagem: '0,00', 
  adiantamentohospedagem: '', 
  hospedagemobservacao: '',
  // Seção PASSEIOS E INGRESSOS
  qtdepasseios1: '0',
  valorpasseios1: '',
  descricaopasseios1: '',
  qtdepasseios2: '0',
  valorpasseios2: '',
  descricaopasseios2: '',
  qtdepasseios3: '0',
  valorpasseios3: '',
  descricaopasseios3: '',
  totaldespesaspasseios: '0,00', 
  adiantamentopasseios: '',
  passeiosobservacao: '',
  // Seção BRINDES E EXTRAS
  qtdebrindes: '0',
  brindesunitario: '',
  brindestotal: '0,00', 
  brindesdescricao: '',
  extras1valor: '',
  extras1descricao: '',
  extras2valor: '',
  extras2descricao: '',
  extras3valor: '',
  extras3descricao: '',
  totaldespesasbrindeesextras: '0,00', 
  adiantamentobrindes: '',
  brindeseextrasobservacao: '',
  // Seção SORTEIOS
  sorteio1qtde: '0',
  sorteio1valor: '',
  sorteio1descricao: '',
  sorteio2qtde: '0',
  sorteio2valor: '',
  sorteio2descricao: '',
  sorteio3qtde: '0',
  sorteio3valor: '',
  sorteio3descricao: '',
  totaldespesassorteios: '0,00', 
  adiantamentosorteios: '',
  sorteiosobservacao: '',
  // Seção OUTRAS DESPESAS
  despesasdiversas: '',
  adiantamentodespesasdiversas: '',
  despesasdiversasobservacao: '',
  // Seção OUTRAS RECEITAS
  outrasreceitasvalor: '',
  outrasreceitasdescricao: '',
  // Seção RESULTADOS (ESTIMATIVA)
  qtdepagantesresultados: '0',
  despesatotal: '0,00',
  pontoequilibrio: '0,00',
  margemdesejada: '30', 
  precosugerido: '0,00', 
  precodefinido: '',
  receitatotal: '0,00',
  lucrobruto: '0,00',
  comissaodivulgacao: '10', 
  comissaodivulgacaovalor: '0,00',
  comissaomaxdivulgacao: '0,00',
  lucroliquido: '0,00',
  // Seção RESULTADOS (REAL)
  qtdepagantesreal: '0',
  qtdepagantesminimo: '0', 
  despesatotalreal: '0,00',
  receitatotalreal: '0,00',
  lucrobrutoreal: '0,00',
  resultadobruto: '0,00', 
  totaldescontosreal: '0,00',
  totalindicacoesreal: '0,00',
  lucroliquidoreal: '0,00',
  observacoesreal: '',
};

interface ViagensFormProps {
  mode: 'new' | 'edit';
  viagemIdToLoad?: string | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
  allowPastDateEditing?: boolean; // New prop
}

const ViagensForm: React.FC<ViagensFormProps> = ({ mode, viagemIdToLoad, onSaveSuccess, onCancel, allowPastDateEditing = false }) => {
  const [formData, setFormData] = useState<ViagensFormData>(initialViagensFormData);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastLoadedViagemId, setLastLoadedViagemId] = useState<string | null>(null);
  const [originalLoadedDataPartida, setOriginalLoadedDataPartida] = useState<string | null>(null);
  const { toast } = useToast();

  const [dataPartidaError, setDataPartidaError] = useState<string | null>(null);
  const [dataRetornoError, setDataRetornoError] = useState<string | null>(null);
  
  const [cidadeTransporteOptions, setCidadeTransporteOptions] = useState<Option[]>([{ value: '', label: 'Carregando cidades...' }]);
  const [isLoadingCidadeTransporte, setIsLoadingCidadeTransporte] = useState(false);
  const [empresaTransporteOptions, setEmpresaTransporteOptions] = useState<Option[]>([{ value: '', label: 'Selecione uma empresa' }]);
  const [isLoadingEmpresaTransporte, setIsLoadingEmpresaTransporte] = useState(false);
  const [tipoVeiculoOptions, setTipoVeiculoOptions] = useState<Option[]>([{ value: '', label: 'Selecione um tipo' }]);

  const [cidadeHospedagemOptions, setCidadeHospedagemOptions] = useState<Option[]>([{ value: '', label: 'Carregando cidades...' }]);
  const [isLoadingCidadeHospedagem, setIsLoadingCidadeHospedagem] = useState(false);
  const [empresaHospedagemOptions, setEmpresaHospedagemOptions] = useState<Option[]>([{ value: '', label: 'Selecione uma empresa' }]);
  const [isLoadingEmpresaHospedagem, setIsLoadingEmpresaHospedagem] = useState(false);


  useEffect(() => {
    const doLoadViagemData = async () => {
      
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('*')
          .eq('id', viagemIdToLoad || '') 
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.datapartida) {
            setOriginalLoadedDataPartida(data.datapartida); // Store YYYY-MM-DD from DB
          } else {
            setOriginalLoadedDataPartida(null);
          }

          const loadedData: Partial<ViagensFormData> = {};
          for (const key in initialViagensFormData) {
            const formKey = key as keyof ViagensFormData;
            if (data.hasOwnProperty(formKey)) {
              const value = data[formKey];
              if (formKey === 'datapartida' || formKey === 'dataretorno') {
                (loadedData as any)[formKey] = convertDateFromSupabaseFormat(value?.toString());
              } else if (formKey === 'margemdesejada' || formKey === 'comissaodivulgacao') { 
                  const numericValue = Number(value); 
                  if (value !== null && value !== undefined && !isNaN(numericValue)) {
                      (loadedData as any)[formKey] = String(Math.round(numericValue * 100));
                  } else {
                      (loadedData as any)[formKey] = initialViagensFormData[formKey]; 
                  }
              } else if (typeof value === 'number' && (
                formKey.includes('valor') || formKey.includes('taxa') || formKey.includes('preco') ||
                formKey.includes('frete') || formKey.startsWith('adiantamento') || formKey.includes('total') ||
                formKey === 'brindestotal' || formKey === 'precosugerido' || formKey === 'pontoequilibrio' || formKey === 'resultadobruto' ||
                formKey.includes('unitario') || formKey.includes('diversas') || formKey.includes('receita') ||
                formKey.includes('lucro') || formKey.includes('comissao') || formKey.includes('desconto'))
              ) {
                (loadedData as any)[formKey] = formatNumberToBRLCurrency(value);
              } else if ((formKey === 'whatsappguia' || formKey === 'whatsapptransporte' || formKey === 'whatsapphospedagem') && value) {
                (loadedData as any)[formKey] = applyPhoneMask(String(value));
              } else if (typeof value === 'number' && (
                  formKey.startsWith('qtde') || 
                  formKey.includes('promocionais') || 
                  formKey.includes('naovendidos')
                  )) {
                (loadedData as any)[formKey] = String(value);
              }
               else {
                (loadedData as any)[formKey] = value === null || value === undefined ? '' : String(value);
              }
            }
          }
          const completeFormData = { ...initialViagensFormData, ...loadedData, id: data.id };
          setFormData(completeFormData);
          setLastLoadedViagemId(viagemIdToLoad!); 
          toast({ title: "Viagem Carregada", description: "Dados da viagem preenchidos no formulário.", variant: "default" });
        } else {
          toast({ title: "Viagem não encontrada", description: "Não foi possível encontrar dados.", variant: "warning" });
          setOriginalLoadedDataPartida(null);
          onCancel(); 
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados da viagem:", error);
        toast({ title: "Erro ao Carregar Dados", description: error.message || "Falha ao buscar dados.", variant: "destructive" });
        setOriginalLoadedDataPartida(null);
        onCancel(); 
      } finally {
        setIsLoadingData(false);
      }
    };

    if (mode === 'new') {
      if (lastLoadedViagemId !== null || formData.id !== undefined) { 
        setFormData(initialViagensFormData);
        setLastLoadedViagemId(null);
      }
      setOriginalLoadedDataPartida(null);
      setIsLoadingData(false);
    } else if (mode === 'edit' && viagemIdToLoad) {
      if (viagemIdToLoad !== lastLoadedViagemId) {
        setIsLoadingData(true); 
        doLoadViagemData();
      } else {
        setIsLoadingData(false); 
      }
    } else if (mode === 'edit' && !viagemIdToLoad) {
      if (lastLoadedViagemId !== null || formData.id !== undefined) {
        setFormData(initialViagensFormData);
        setLastLoadedViagemId(null);
      }
      setOriginalLoadedDataPartida(null);
      setIsLoadingData(false);
    }
  }, [mode, viagemIdToLoad, lastLoadedViagemId, onCancel, toast]);

  const isOriginalDateInPast = useMemo(() => {
    if (mode !== 'edit' || !originalLoadedDataPartida) return false;
    const originalDate = parseUIDateToDate(convertDateFromSupabaseFormat(originalLoadedDataPartida));
    if (!originalDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return originalDate < today;
  }, [mode, originalLoadedDataPartida]);

  const computedDateFieldsDisabled = isLoadingData || (mode === 'edit' && isOriginalDateInPast && !allowPastDateEditing);


  // Fetch Cidades for Transporte
  useEffect(() => {
    const fetchCidadesTransporte = async () => {
      setIsLoadingCidadeTransporte(true);
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('cidade') 
          .eq('fretamento', true) 
          .not('cidade', 'is', null) 
          .order('cidade', { ascending: true });

        if (error) throw error;
        
        if (data && Array.isArray(data)) {
           const cityStrings: string[] = data
            .map((item: any) => item.cidade as string | null) 
            .filter((cValue): cValue is string => typeof cValue === 'string' && cValue.trim() !== '');
          const distinctCities: string[] = [...new Set(cityStrings)];
          
          if (distinctCities.length > 0) {
            const newOptions: Option[] = distinctCities.map(city => ({ value: city, label: city }));
            setCidadeTransporteOptions([{ value: '', label: 'Selecione uma cidade' }, ...newOptions]);
          } else {
            setCidadeTransporteOptions([{ value: '', label: 'Nenhuma cidade (transporte) encontrada' }]);
          }
        } else {
          setCidadeTransporteOptions([{ value: '', label: 'Nenhuma cidade (transporte) encontrada' }]);
        }
      } catch (error: any) {
        console.error("Erro ao buscar cidades para transporte:", error);
        toast({ title: "Erro Cidades Transporte", description: error.message || "Falha ao buscar cidades.", variant: "destructive" });
        const errorOptionItem: Option = { value: '', label: 'Erro ao carregar' };
        setCidadeTransporteOptions([errorOptionItem]);
      } finally {
        setIsLoadingCidadeTransporte(false);
      }
    };
    fetchCidadesTransporte();
  }, [toast]);

  // Fetch Empresas de Transporte when cidadetransporte changes
  useEffect(() => {
    const fetchEmpresasTransporte = async () => {
      const currentCidadeTransporte = formData.cidadetransporte;
      const originalEmpresaTransporte = formData.empresatransporte; // This is now a name

      if (!currentCidadeTransporte || currentCidadeTransporte === '') {
        setEmpresaTransporteOptions([{ value: '', label: 'Selecione uma cidade primeiro' }]);
        if (formData.empresatransporte || formData.contatotransporte || formData.whatsapptransporte || formData.tipoveiculo || formData.qtdeassentos !== '0') {
            setFormData(prev => ({
                ...prev,
                empresatransporte: '',
                contatotransporte: '',
                whatsapptransporte: '',
                tipoveiculo: '',
                qtdeassentos: '0',
            }));
        }
        setTipoVeiculoOptions([{ value: '', label: 'Selecione um tipo'}]);
        return;
      }
      setIsLoadingEmpresaTransporte(true);
      setEmpresaTransporteOptions([{ value: '', label: 'Carregando empresas...' }]);
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('nome_fornecedor') // Fetching name directly for value and label
          .eq('cidade', currentCidadeTransporte)
          .eq('fretamento', true)
          .order('nome_fornecedor', { ascending: true });

        if (error) throw error;

        const newOptions = data.map((f: any) => ({ value: f.nome_fornecedor, label: f.nome_fornecedor }));
        const finalOptions = [{ value: '', label: 'Selecione uma empresa' }, ...newOptions];
        setEmpresaTransporteOptions(finalOptions);
        
        const isOriginalEmpresaValid = finalOptions.some(opt => opt.value === originalEmpresaTransporte);

        setFormData(prev => ({ 
          ...prev,
          empresatransporte: isOriginalEmpresaValid ? originalEmpresaTransporte : '',
          contatotransporte: isOriginalEmpresaValid ? prev.contatotransporte : '',
          whatsapptransporte: isOriginalEmpresaValid ? prev.whatsapptransporte : '',
          tipoveiculo: isOriginalEmpresaValid ? prev.tipoveiculo : '',
          qtdeassentos: isOriginalEmpresaValid ? prev.qtdeassentos : '0',
        }));
        if (!isOriginalEmpresaValid) {
            setTipoVeiculoOptions([{ value: '', label: 'Selecione um tipo'}]);
        }

      } catch (error: any) {
        toast({ title: "Erro Empresas Transporte", description: error.message, variant: "destructive" });
        setEmpresaTransporteOptions([{ value: '', label: 'Erro ao carregar' }]);
      } finally {
        setIsLoadingEmpresaTransporte(false);
      }
    };
    fetchEmpresasTransporte();
  }, [formData.cidadetransporte, toast]);


  // Fetch Fornecedor Details (contact, whatsapp, vehicle types) when empresatransporte (NAME) and cidadetransporte changes
  useEffect(() => {
    const fetchFornecedorDetails = async () => {
      const currentEmpresaTransporteNome = formData.empresatransporte; // This is the NAME
      const currentCidadeTransporte = formData.cidadetransporte;
      const originalTipoVeiculo = formData.tipoveiculo;
      const originalQtdeAssentos = formData.qtdeassentos;

      if (!currentEmpresaTransporteNome || typeof currentEmpresaTransporteNome !== 'string' || currentEmpresaTransporteNome.trim() === '' || 
          !currentCidadeTransporte || typeof currentCidadeTransporte !== 'string' || currentCidadeTransporte.trim() === '' || 
          false) {
        if (formData.contatotransporte || formData.whatsapptransporte || formData.tipoveiculo || formData.qtdeassentos !== '0') {
            setFormData(prev => ({
                ...prev,
                contatotransporte: '',
                whatsapptransporte: '',
                tipoveiculo: '',
                qtdeassentos: '0',
            }));
        }
        setTipoVeiculoOptions([{ value: '', label: 'Selecione uma empresa e cidade' }]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('nome_contato, whatsapp, onibus, semi_leito, microonibus, van, carro')
          .eq('nome_fornecedor', currentEmpresaTransporteNome) 
          .eq('cidade', currentCidadeTransporte) // Use city to help disambiguate
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
            toast({ title: "Erro Detalhes Fornecedor", description: error.message || "Falha ao buscar detalhes.", variant: "destructive" });
             setFormData(prev => ({ 
                ...prev,
                contatotransporte: '',
                whatsapptransporte: '',
                tipoveiculo: '',
                qtdeassentos: '0',
            }));
            setTipoVeiculoOptions([{ value: '', label: 'Erro ao carregar tipos' }]);
            return;
        }
        
        if (data) {
          const newDynamicTipoVeiculoOptions: Option[] = [];
          if (data.onibus) newDynamicTipoVeiculoOptions.push({ value: 'Onibus', label: 'Ônibus' });
          if (data.semi_leito) newDynamicTipoVeiculoOptions.push({ value: 'SemiLeito', label: 'Ônibus Semi-Leito' });
          if (data.microonibus) newDynamicTipoVeiculoOptions.push({ value: 'Microonibus', label: 'Micro-ônibus' });
          if (data.van) newDynamicTipoVeiculoOptions.push({ value: 'Van', label: 'Van' });
          if (data.carro) newDynamicTipoVeiculoOptions.push({ value: 'CarroExecutivo', label: 'Carro Executivo' });

          const finalDynamicTipoVeiculoOptions = newDynamicTipoVeiculoOptions.length > 0
              ? [{ value: '', label: 'Selecione um tipo' }, ...newDynamicTipoVeiculoOptions]
              : [{ value: '', label: 'Nenhum tipo disponível' }];
          setTipoVeiculoOptions(finalDynamicTipoVeiculoOptions);
          
          const isOriginalTipoVeiculoValid = finalDynamicTipoVeiculoOptions.some(opt => opt.value === originalTipoVeiculo);

          setFormData(prev => ({
            ...prev,
            contatotransporte: data.nome_contato || '',
            whatsapptransporte: data.whatsapp ? applyPhoneMask(data.whatsapp) : '',
            tipoveiculo: isOriginalTipoVeiculoValid ? originalTipoVeiculo : '', 
            qtdeassentos: isOriginalTipoVeiculoValid && originalTipoVeiculo ? originalQtdeAssentos : '0', 
          }));
        } else { 
            setFormData(prev => ({
                ...prev,
                contatotransporte: '',
                whatsapptransporte: '',
                tipoveiculo: '',
                qtdeassentos: '0',
            }));
            setTipoVeiculoOptions([{ value: '', label: 'Selecione uma empresa' }]);
            if (error && error.code === 'PGRST116'){ 
                 toast({ title: "Detalhes Fornecedor", description: `Fornecedor "${currentEmpresaTransporteNome}" não encontrado em ${currentCidadeTransporte}.`, variant: "warning" });
            }
        }
      } catch (error: any) { 
        toast({ title: "Erro Detalhes Fornecedor", description: error.message || "Falha inesperada.", variant: "destructive" });
        setTipoVeiculoOptions([{ value: '', label: 'Erro ao carregar tipos' }]);
        setFormData(prev => ({
          ...prev,
          contatotransporte: '',
          whatsapptransporte: '',
          tipoveiculo: '',
          qtdeassentos: '0',
        }));
      }
    };
    fetchFornecedorDetails();
  }, [formData.empresatransporte, formData.cidadetransporte, toast]);


  // Fetch Cidades for Hospedagem
  useEffect(() => {
    const fetchCidadesHospedagem = async () => {
      setIsLoadingCidadeHospedagem(true);
      try {
        const { data: resultData, error } = await supabase
          .from('fornecedores')
          .select('cidade') 
          .eq('hospedagem', true) 
          .not('cidade', 'is', null) 
          .order('cidade', { ascending: true });

        if (error) {
          console.error("Supabase error fetching cidades hospedagem:", error);
          throw error;
        }
        
        if (resultData && Array.isArray(resultData)) {
           const cityStrings: string[] = resultData
            .map((item: any) => item.cidade as string | null) 
            .filter((cValue): cValue is string => typeof cValue === 'string' && cValue.trim() !== ''); 
          const distinctCities: string[] = [...new Set(cityStrings)]; 
          
          if (distinctCities.length > 0) {
            const newOptions: Option[] = distinctCities.map(city => ({ value: city, label: city }));
            setCidadeHospedagemOptions([{ value: '', label: 'Selecione uma cidade' }, ...newOptions]);
          } else {
            console.warn("fetchCidadesHospedagem: Query successful but no distinct cities found matching criteria.");
            setCidadeHospedagemOptions([{ value: '', label: 'Nenhuma cidade com hospedagem encontrada' }]);
          }
        } else {
          console.warn("fetchCidadesHospedagem: Query successful but resultData is null or not an array.");
          setCidadeHospedagemOptions([{ value: '', label: 'Nenhuma cidade (dados não encontrados)' }]);
        }
      } catch (error: any) {
        console.error("Catch block: Erro ao buscar cidades para hospedagem:", error);
        toast({ title: "Erro Cidades Hospedagem", description: error.message || "Falha ao buscar cidades.", variant: "destructive" });
        setCidadeHospedagemOptions([{ value: '', label: 'Erro ao carregar cidades' }]);
      } finally {
        setIsLoadingCidadeHospedagem(false);
      }
    };
    fetchCidadesHospedagem();
  }, [toast]);

  // Fetch Empresas de Hospedagem when cidadehospedagem changes
  useEffect(() => {
    const fetchEmpresasHospedagem = async () => {
      const currentCidadeHospedagem = formData.cidadehospedagem;
      const originalEmpresaHospedagem = formData.empresahospedagem; // This is now a name

      if (!currentCidadeHospedagem || currentCidadeHospedagem === '') {
        setEmpresaHospedagemOptions([{ value: '', label: 'Selecione uma cidade primeiro' }]);
        if (formData.empresahospedagem || formData.tipohospedagem || formData.contatohospedagem || formData.whatsapphospedagem) {
            setFormData(prev => ({
            ...prev,
            empresahospedagem: '',
            tipohospedagem: '',
            contatohospedagem: '',
            whatsapphospedagem: '',
            }));
        }
        return;
      }
      setIsLoadingEmpresaHospedagem(true);
      setEmpresaHospedagemOptions([{ value: '', label: 'Carregando empresas...' }]);
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('nome_fornecedor') // Fetching name directly
          .eq('cidade', currentCidadeHospedagem)
          .eq('hospedagem', true)
          .order('nome_fornecedor', { ascending: true });

        if (error) throw error;

        const newOptions = data.map((f: any) => ({ value: f.nome_fornecedor, label: f.nome_fornecedor }));
        const finalOptions = [{ value: '', label: 'Selecione uma empresa' }, ...newOptions];
        setEmpresaHospedagemOptions(finalOptions);

        const isOriginalEmpresaValid = finalOptions.some(opt => opt.value === originalEmpresaHospedagem);

        setFormData(prev => ({ 
          ...prev,
          empresahospedagem: isOriginalEmpresaValid ? originalEmpresaHospedagem : '',
          tipohospedagem: isOriginalEmpresaValid ? prev.tipohospedagem : '',
          contatohospedagem: isOriginalEmpresaValid ? prev.contatohospedagem : '',
          whatsapphospedagem: isOriginalEmpresaValid ? prev.whatsapphospedagem : '',
        }));

      } catch (error: any) {
        toast({ title: "Erro Empresas Hospedagem", description: error.message, variant: "destructive" });
        setEmpresaHospedagemOptions([{ value: '', label: 'Erro ao carregar' }]);
      } finally {
        setIsLoadingEmpresaHospedagem(false);
      }
    };
    fetchEmpresasHospedagem();
  }, [formData.cidadehospedagem, toast]);

  // Fetch Hospedagem Details (contact, whatsapp, type) when empresahospedagem (NAME) and cidadehospedagem changes
  useEffect(() => {
    const fetchHospedagemDetails = async () => {
      const currentEmpresaHospedagemNome = formData.empresahospedagem; // This is the NAME
      const currentCidadeHospedagem = formData.cidadehospedagem;

      if (!currentEmpresaHospedagemNome || typeof currentEmpresaHospedagemNome !== 'string' || currentEmpresaHospedagemNome.trim() === '' || 
          !currentCidadeHospedagem || typeof currentCidadeHospedagem !== 'string' || currentCidadeHospedagem.trim() === '' || 
          false) {
        if (formData.tipohospedagem || formData.contatohospedagem || formData.whatsapphospedagem) {
            setFormData(prev => ({
            ...prev,
            tipohospedagem: '',
            contatohospedagem: '',
            whatsapphospedagem: '',
            }));
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('tipohospedagem, nome_contato, whatsapp')
          .eq('nome_fornecedor', currentEmpresaHospedagemNome)
          .eq('cidade', currentCidadeHospedagem) // Use city to help disambiguate
          .single();
        
        if (error && error.code !== 'PGRST116') {
            toast({ title: "Erro Detalhes Hospedagem", description: error.message || "Falha ao buscar detalhes.", variant: "destructive" });
            setFormData(prev => ({
                ...prev,
                tipohospedagem: '',
                contatohospedagem: '',
                whatsapphospedagem: '',
            }));
            return;
        }

        if (data) {
          setFormData(prev => ({
            ...prev,
            tipohospedagem: data.tipohospedagem || '',
            contatohospedagem: data.nome_contato || '',
            whatsapphospedagem: data.whatsapp ? applyPhoneMask(data.whatsapp) : '',
          }));
        } else { 
            setFormData(prev => ({ 
                ...prev,
                tipohospedagem: '',
                contatohospedagem: '',
                whatsapphospedagem: '',
            }));
             if (error && error.code === 'PGRST116'){
                 toast({ title: "Detalhes Hospedagem", description: `Fornecedor "${currentEmpresaHospedagemNome}" não encontrado em ${currentCidadeHospedagem}.`, variant: "warning" });
            }
        }
      } catch (error: any) {
        toast({ title: "Erro Detalhes Hospedagem", description: error.message || "Falha inesperada.", variant: "destructive" });
         setFormData(prev => ({ 
            ...prev,
            tipohospedagem: '',
            contatohospedagem: '',
            whatsapphospedagem: '',
        }));
      }
    };
    fetchHospedagemDetails();
  }, [formData.empresahospedagem, formData.cidadehospedagem, toast]);


  // CALCULATION useEffects (Non-Estimativa)

  // 1. totaldespesastaxas
  useEffect(() => {
    const taxaCidade = parseBRLCurrency(formData.taxacidade) || 0;
    const outrasTaxas = parseBRLCurrency(formData.outrastaxasvalor) || 0;
    const estacionamento = parseBRLCurrency(formData.estacionamento) || 0;
    const taxaGuia = parseBRLCurrency(formData.taxaguialocal) || 0;
    const total = taxaCidade + outrasTaxas + estacionamento + taxaGuia;
    setFormData(prev => ({ ...prev, totaldespesastaxas: formatNumberToBRLCurrency(total) }));
  }, [formData.taxacidade, formData.outrastaxasvalor, formData.estacionamento, formData.taxaguialocal]);

  // 2. qtdenaopagantes (Transporte)
  useEffect(() => {
    const reservados = parseInt(formData.qtdereservadosguias || '0', 10) || 0;
    const promocionais = parseInt(formData.qtdepromocionais || '0', 10) || 0;
    const naoVendidos = parseInt(formData.naovendidos || '0', 10) || 0;
    const total = reservados + promocionais + naoVendidos;
    setFormData(prev => ({ ...prev, qtdenaopagantes: String(total) }));
  }, [formData.qtdereservadosguias, formData.qtdepromocionais, formData.naovendidos]);

  // 3. qtdepagantes (Transporte)
  useEffect(() => {
    const assentos = parseInt(formData.qtdeassentos || '0', 10) || 0;
    const naoPagantes = parseInt(formData.qtdenaopagantes || '0', 10) || 0;
    const total = Math.max(0, assentos - naoPagantes); // Ensure not negative
    setFormData(prev => ({ ...prev, qtdepagantes: String(total) }));
  }, [formData.qtdeassentos, formData.qtdenaopagantes]);

  // 4. totalrefeicaomotorista
  useEffect(() => {
    const qtdeMotoristas = parseInt(formData.qtdemotoristas || '0', 10) || 0;
    const almocos = parseInt(formData.qtdealmocosmotoristas || '0', 10) || 0;
    const jantas = parseInt(formData.qtdejantasmotoristas || '0', 10) || 0;
    const valorUnitario = parseBRLCurrency(formData.refeicaomotoristaunitario) || 0;
    const total = qtdeMotoristas * (almocos + jantas) * valorUnitario;
    setFormData(prev => ({ ...prev, totalrefeicaomotorista: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdemotoristas, formData.qtdealmocosmotoristas, formData.qtdejantasmotoristas, formData.refeicaomotoristaunitario]);

  // 5. totaldeslocamentosmotoristas
  useEffect(() => {
    const qtdeDeslocamentos = parseInt(formData.qtdedeslocamentosmotoristas || '0', 10) || 0;
    const valorUnitario = parseBRLCurrency(formData.deslocamentomotoristaunitario) || 0;
    const total = qtdeDeslocamentos * valorUnitario;
    setFormData(prev => ({ ...prev, totaldeslocamentosmotoristas: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdedeslocamentosmotoristas, formData.deslocamentomotoristaunitario]);

  // 6. totaldespesasmotoristas
  useEffect(() => {
    const totalRefeicoes = parseBRLCurrency(formData.totalrefeicaomotorista) || 0;
    const totalDeslocamentos = parseBRLCurrency(formData.totaldeslocamentosmotoristas) || 0;
    const total = totalRefeicoes + totalDeslocamentos;
    setFormData(prev => ({ ...prev, totaldespesasmotoristas: formatNumberToBRLCurrency(total) }));
  }, [formData.totalrefeicaomotorista, formData.totaldeslocamentosmotoristas]);

  // 7. totaldespesastraslados
  useEffect(() => {
    const qtde1 = parseInt(formData.qtdetraslado1 || '0', 10) || 0;
    const valor1 = parseBRLCurrency(formData.traslado1valor) || 0;
    const qtde2 = parseInt(formData.qtdetraslado2 || '0', 10) || 0;
    const valor2 = parseBRLCurrency(formData.traslado2valor) || 0;
    const qtde3 = parseInt(formData.qtdetraslado3 || '0', 10) || 0;
    const valor3 = parseBRLCurrency(formData.traslado3valor) || 0;
    const total = (qtde1 * valor1) + (qtde2 * valor2) + (qtde3 * valor3);
    setFormData(prev => ({ ...prev, totaldespesastraslados: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdetraslado1, formData.traslado1valor, formData.qtdetraslado2, formData.traslado2valor, formData.qtdetraslado3, formData.traslado3valor]);
  
  // 8. qtdehospedes
  useEffect(() => {
    const assentos = parseInt(formData.qtdeassentos || '0', 10) || 0;
    const motoristas = parseInt(formData.qtdemotoristas || '0', 10) || 0;
    const total = assentos + motoristas;
    setFormData(prev => ({ ...prev, qtdehospedes: String(total) }));
  }, [formData.qtdeassentos, formData.qtdemotoristas]);
  
  // 9. qtdediarias
  useEffect(() => {
    const partida = parseUIDateToDate(formData.datapartida);
    const retorno = parseUIDateToDate(formData.dataretorno);
    let numberOfNights = 0; 
    if (partida && retorno && retorno > partida) {
      const diffInMs = retorno.getTime() - partida.getTime();
      numberOfNights = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); 
    }
    const qtdediariasFinal = Math.max(0, numberOfNights - 1); 
    setFormData(prev => ({ ...prev, qtdediarias: String(qtdediariasFinal) }));
  }, [formData.datapartida, formData.dataretorno]);

  // 10. totaldiarias (Hospedagem)
  useEffect(() => {
    const diarias = parseInt(formData.qtdediarias || '0', 10);
    const hospedesNum = parseInt(formData.qtdehospedes || '0', 10);
    const valorUnitarioNum = parseBRLCurrency(formData.valordiariaunitario) || 0;
    const total = diarias * hospedesNum * valorUnitarioNum;
    setFormData(prev => ({ ...prev, totaldiarias: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdediarias, formData.qtdehospedes, formData.valordiariaunitario]); 

  // 11. totaldespesashospedagem
  useEffect(() => {
    const totalDiariasValor = parseBRLCurrency(formData.totaldiarias) || 0;
    const outrosServicos = parseBRLCurrency(formData.outrosservicosvalor) || 0;
    const total = totalDiariasValor + outrosServicos;
    setFormData(prev => ({ ...prev, totaldespesashospedagem: formatNumberToBRLCurrency(total) }));
  }, [formData.totaldiarias, formData.outrosservicosvalor]);

  // 12. totaldespesaspasseios
  useEffect(() => {
    const qtde1 = parseInt(formData.qtdepasseios1 || '0', 10) || 0;
    const valor1 = parseBRLCurrency(formData.valorpasseios1) || 0;
    const qtde2 = parseInt(formData.qtdepasseios2 || '0', 10) || 0;
    const valor2 = parseBRLCurrency(formData.valorpasseios2) || 0;
    const qtde3 = parseInt(formData.qtdepasseios3 || '0', 10) || 0;
    const valor3 = parseBRLCurrency(formData.valorpasseios3) || 0;
    const total = (qtde1 * valor1) + (qtde2 * valor2) + (qtde3 * valor3);
    setFormData(prev => ({ ...prev, totaldespesaspasseios: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdepasseios1, formData.valorpasseios1, formData.qtdepasseios2, formData.valorpasseios2, formData.qtdepasseios3, formData.valorpasseios3]);

  // 13. brindestotal
  useEffect(() => {
    const qtde = parseInt(formData.qtdebrindes || '0', 10) || 0;
    const valorUnitario = parseBRLCurrency(formData.brindesunitario) || 0;
    const total = qtde * valorUnitario;
    setFormData(prev => ({ ...prev, brindestotal: formatNumberToBRLCurrency(total) }));
  }, [formData.qtdebrindes, formData.brindesunitario]);

  // 14. totaldespesasbrindeesextras
  useEffect(() => {
    const totalBrindesValor = parseBRLCurrency(formData.brindestotal) || 0; 
    const extra1 = parseBRLCurrency(formData.extras1valor) || 0;
    const extra2 = parseBRLCurrency(formData.extras2valor) || 0;
    const extra3 = parseBRLCurrency(formData.extras3valor) || 0;
    const total = totalBrindesValor + extra1 + extra2 + extra3;
    setFormData(prev => ({ ...prev, totaldespesasbrindeesextras: formatNumberToBRLCurrency(total) }));
  }, [formData.brindestotal, formData.extras1valor, formData.extras2valor, formData.extras3valor]);

  // 15. totaldespesassorteios
  useEffect(() => {
    const qtde1 = parseInt(formData.sorteio1qtde || '0', 10) || 0;
    const valor1 = parseBRLCurrency(formData.sorteio1valor) || 0;
    const qtde2 = parseInt(formData.sorteio2qtde || '0', 10) || 0;
    const valor2 = parseBRLCurrency(formData.sorteio2valor) || 0;
    const qtde3 = parseInt(formData.sorteio3qtde || '0', 10) || 0;
    const valor3 = parseBRLCurrency(formData.sorteio3valor) || 0;
    const total = (qtde1 * valor1) + (qtde2 * valor2) + (qtde3 * valor3);
    setFormData(prev => ({ ...prev, totaldespesassorteios: formatNumberToBRLCurrency(total) }));
  }, [formData.sorteio1qtde, formData.sorteio1valor, formData.sorteio2qtde, formData.sorteio2valor, formData.sorteio3qtde, formData.sorteio3valor]);

  // CALCULATION useEffects (RESULTADOS ESTIMATIVA)

  // qtdepagantesresultados (mirrors qtdepagantes from Transporte section)
  useEffect(() => {
    setFormData(prev => ({ ...prev, qtdepagantesresultados: prev.qtdepagantes }));
  }, [formData.qtdepagantes]);

  // despesatotal
  useEffect(() => {
    const tTaxas = parseBRLCurrency(formData.totaldespesastaxas) || 0;
    const tFrete = parseBRLCurrency(formData.frete) || 0;
    const tMotoristas = parseBRLCurrency(formData.totaldespesasmotoristas) || 0;
    const tTraslados = parseBRLCurrency(formData.totaldespesastraslados) || 0;
    const tHospedagem = parseBRLCurrency(formData.totaldespesashospedagem) || 0;
    const tPasseios = parseBRLCurrency(formData.totaldespesaspasseios) || 0;
    const tBrindesExtras = parseBRLCurrency(formData.totaldespesasbrindeesextras) || 0;
    const tSorteios = parseBRLCurrency(formData.totaldespesassorteios) || 0;
    const tDiversas = parseBRLCurrency(formData.despesasdiversas) || 0;
    const total = tTaxas + tFrete + tMotoristas + tTraslados + tHospedagem + tPasseios + tBrindesExtras + tSorteios + tDiversas;
    setFormData(prev => ({ ...prev, despesatotal: formatNumberToBRLCurrency(total) }));
  }, [
    formData.totaldespesastaxas, formData.frete, formData.totaldespesasmotoristas,
    formData.totaldespesastraslados, formData.totaldespesashospedagem, formData.totaldespesaspasseios,
    formData.totaldespesasbrindeesextras, formData.totaldespesassorteios, formData.despesasdiversas,
  ]);

  // pontoequilibrio
  useEffect(() => {
    const despesaTotalNum = parseBRLCurrency(formData.despesatotal) || 0;
    const qtdePagantesNum = parseInt(formData.qtdepagantesresultados || '0', 10);
    const pe = qtdePagantesNum > 0 ? despesaTotalNum / qtdePagantesNum : 0;
    setFormData(prev => ({ ...prev, pontoequilibrio: formatNumberToBRLCurrency(pe) }));
  }, [formData.despesatotal, formData.qtdepagantesresultados]);

  // precosugerido
  useEffect(() => {
    const pontoEquilibrioNum = parseBRLCurrency(formData.pontoequilibrio) || 0;
    const margemDesejadaStr = formData.margemdesejada || '0';
    const margemDesejadaNum = parseFloat(margemDesejadaStr.replace(',', '.')) / 100;
    const preco = pontoEquilibrioNum * (1 + margemDesejadaNum);
    setFormData(prev => ({ ...prev, precosugerido: formatNumberToBRLCurrency(preco) }));
  }, [formData.pontoequilibrio, formData.margemdesejada]);

  // receitatotal
  useEffect(() => {
    const precoDefinidoNum = parseBRLCurrency(formData.precodefinido) || 0;
    const qtdePagantesNum = parseInt(formData.qtdepagantesresultados || '0', 10);
    const receita = precoDefinidoNum * qtdePagantesNum;
    setFormData(prev => ({ ...prev, receitatotal: formatNumberToBRLCurrency(receita) }));
  }, [formData.precodefinido, formData.qtdepagantesresultados]);

  // lucrobruto
  useEffect(() => {
    const receitaTotalNum = parseBRLCurrency(formData.receitatotal) || 0;
    const despesaTotalNum = parseBRLCurrency(formData.despesatotal) || 0;
    const lucro = receitaTotalNum - despesaTotalNum;
    setFormData(prev => ({ ...prev, lucrobruto: formatNumberToBRLCurrency(lucro) }));
  }, [formData.receitatotal, formData.despesatotal]);
  
  // comissaodivulgacaovalor (per ticket)
  useEffect(() => {
    const precoDefinidoNum = parseBRLCurrency(formData.precodefinido) || 0;
    const comissaoStr = formData.comissaodivulgacao || '0'; // Should be "10" for 10%
    const comissaoPerc = parseFloat(comissaoStr.replace(',', '.')) / 100; // Converts "10" to 0.10
    const comissaoValor = precoDefinidoNum * comissaoPerc;
    setFormData(prev => ({ ...prev, comissaodivulgacaovalor: formatNumberToBRLCurrency(comissaoValor) }));
  }, [formData.precodefinido, formData.comissaodivulgacao]);

  // comissaomaxdivulgacao (total potential)
  useEffect(() => {
    const comissaoTicketValor = parseBRLCurrency(formData.comissaodivulgacaovalor) || 0;
    const qtdePagantesNum = parseInt(formData.qtdepagantesresultados || '0', 10);
    const comissaoTotal = comissaoTicketValor * qtdePagantesNum;
    setFormData(prev => ({ ...prev, comissaomaxdivulgacao: formatNumberToBRLCurrency(comissaoTotal) }));
  }, [formData.comissaodivulgacaovalor, formData.qtdepagantesresultados]);

  // lucroliquido
  useEffect(() => {
    const lucroBrutoNum = parseBRLCurrency(formData.lucrobruto) || 0;
    const comissaoMaxDivulgacaoNum = parseBRLCurrency(formData.comissaomaxdivulgacao) || 0;
    const lucro = lucroBrutoNum - comissaoMaxDivulgacaoNum;
    setFormData(prev => ({ ...prev, lucroliquido: formatNumberToBRLCurrency(lucro) }));
  }, [formData.lucrobruto, formData.comissaomaxdivulgacao]);

  // CALCULATION useEffects (RESULTADOS REAL)

  // Fetch real passenger data and discounts
  useEffect(() => {
    const fetchRealData = async () => {
        if (!formData.id) {
            setFormData(prev => ({
                ...prev,
                qtdepagantesreal: '0',
                totaldescontosreal: '0,00',
                totalindicacoesreal: '0,00',
            }));
            return;
        }

        setIsLoadingData(true); 
        try {
            const { count: passengerCount, error: countError } = await supabase
                .from('passageiros')
                .select('id', { count: 'exact', head: true })
                .eq('idviagem', formData.id);

            if (countError) {
                toast({ title: "Erro (Pagantes Real)", description: countError.message, variant: "destructive" });
            }
            
            const { data: descontosData, error: descontosError } = await supabase
                .from('passageiros')
                .select('descontopromocional')
                .eq('idviagem', formData.id);

            if (descontosError) {
                toast({ title: "Erro (Descontos Real)", description: descontosError.message, variant: "destructive" });
            }
            const totalDescontos = descontosData?.reduce((sum, item) => sum + (Number(item.descontopromocional) || 0), 0) || 0;

            const { data: indicacoesData, error: indicacoesError } = await supabase
                .from('passageiros')
                .select('descontoindicacoes')
                .eq('idviagem', formData.id);
            
            if (indicacoesError) {
                toast({ title: "Erro (Indicações Real)", description: indicacoesError.message, variant: "destructive" });
            }
            const totalIndicacoes = indicacoesData?.reduce((sum, item) => sum + (Number(item.descontoindicacoes) || 0), 0) || 0;

            setFormData(prev => ({
                ...prev,
                qtdepagantesreal: String(passengerCount || 0),
                totaldescontosreal: formatNumberToBRLCurrency(totalDescontos),
                totalindicacoesreal: formatNumberToBRLCurrency(totalIndicacoes),
            }));

        } catch (error: any) {
            toast({ title: "Erro ao buscar dados reais", description: error.message, variant: "destructive" });
            setFormData(prev => ({
                ...prev,
                qtdepagantesreal: '0',
                totaldescontosreal: '0,00',
                totalindicacoesreal: '0,00',
            }));
        } finally {
            setIsLoadingData(false);
        }
    };

    fetchRealData();
  }, [formData.id, toast]); 
  
  // despesatotalreal (mirrors despesatotal from Estimativa section)
  useEffect(() => {
    setFormData(prev => ({ ...prev, despesatotalreal: prev.despesatotal || '0,00' }));
  }, [formData.despesatotal]);

  // qtdepagantesminimo (Real)
  useEffect(() => {
    const despesaTotalNum = parseBRLCurrency(formData.despesatotal) || 0;
    const totalDescontosNum = parseBRLCurrency(formData.totaldescontosreal) || 0;
    const totalIndicacoesNum = parseBRLCurrency(formData.totalindicacoesreal) || 0;
    const precoDefinidoNum = parseBRLCurrency(formData.precodefinido) || 0;
    const soma = despesaTotalNum + totalDescontosNum + totalIndicacoesNum;
    const minimo = precoDefinidoNum > 0 ? Math.ceil(soma / precoDefinidoNum) : 0;
    setFormData(prev => ({ ...prev, qtdepagantesminimo: String(minimo) }));
  }, [formData.despesatotal, formData.precodefinido, formData.totaldescontosreal, formData.totalindicacoesreal]);

  // receitatotalreal
  useEffect(() => {
    const pagantesReaisNum = parseInt(formData.qtdepagantesreal || '0', 10);
    const precoDefinidoNum = parseBRLCurrency(formData.precodefinido) || 0;
    const receita = pagantesReaisNum * precoDefinidoNum;
    setFormData(prev => ({ ...prev, receitatotalreal: formatNumberToBRLCurrency(receita) }));
  }, [formData.qtdepagantesreal, formData.precodefinido]);

  // lucrobrutoreal
  useEffect(() => {
    const receitaRealNum = parseBRLCurrency(formData.receitatotalreal) || 0;
    const despesaRealNum = parseBRLCurrency(formData.despesatotalreal) || 0;
    const lucro = receitaRealNum - despesaRealNum;
    setFormData(prev => ({ ...prev, lucrobrutoreal: formatNumberToBRLCurrency(lucro) }));
  }, [formData.receitatotalreal, formData.despesatotalreal]);
  
  // resultadobruto (same as lucrobrutoreal)
  useEffect(() => {
      setFormData(prev => ({ ...prev, resultadobruto: prev.lucrobrutoreal || '0,00'}));
  }, [formData.lucrobrutoreal]);

  // lucroliquidoreal
  useEffect(() => {
    const resultadoBrutoNum = parseBRLCurrency(formData.resultadobruto) || 0;
    const descontosReaisNum = parseBRLCurrency(formData.totaldescontosreal) || 0;
    const indicacoesReaisNum = parseBRLCurrency(formData.totalindicacoesreal) || 0;
    const lucroLiquido = resultadoBrutoNum - descontosReaisNum - indicacoesReaisNum;
    
    console.log(`[LUCRO_LIQUIDO_REAL_CALC] Trip ID: ${formData.id || 'N/A'}`, {
        resultadobruto_str: formData.resultadobruto,
        resultadobruto_num: resultadoBrutoNum,
        totaldescontosreal_str: formData.totaldescontosreal,
        totaldescontosreal_num: descontosReaisNum,
        totalindicacoesreal_str: formData.totalindicacoesreal,
        totalindicacoesreal_num: indicacoesReaisNum,
        calculated_lucroLiquido: lucroLiquido,
        formatted_for_setFormData: formatNumberToBRLCurrency(lucroLiquido),
        current_formData_lucroliquidoreal_before_set: formData.lucroliquidoreal
      });

    setFormData(prev => ({ ...prev, lucroliquidoreal: formatNumberToBRLCurrency(lucroLiquido) }));
  }, [formData.resultadobruto, formData.totaldescontosreal, formData.totalindicacoesreal, formData.id]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as ViagensFormFieldName;
    
    setFormData(prev => {
        let newState = { ...prev, [fieldName]: value };
        
        if (fieldName === 'cidadetransporte') {
            newState.empresatransporte = ''; 
            newState.contatotransporte = '';
            newState.whatsapptransporte = '';
            newState.tipoveiculo = '';
            newState.qtdeassentos = '0';
        } else if (fieldName === 'empresatransporte') { 
            newState.tipoveiculo = ''; 
            newState.qtdeassentos = '0';
        } else if (fieldName === 'cidadehospedagem') { 
           newState.empresahospedagem = ''; 
           newState.tipohospedagem = '';
           newState.contatohospedagem = '';
           newState.whatsapphospedagem = '';
        } else if (fieldName === 'empresahospedagem') { 
           newState.tipohospedagem = '';
           newState.contatohospedagem = '';
           newState.whatsapphospedagem = '';
        }
        return newState;
    });
  }, []);

  useEffect(() => {
    const { datapartida } = formData;
    let newError: string | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (datapartida) {
        if (datapartida.length > 0 && datapartida.length < 10) {
            newError = 'Data de partida incompleta (DD/MM/AAAA).';
        } else if (datapartida.length === 10) {
            const parts = datapartida.split('/');
            const year = parseInt(parts[2], 10);

            if (year < 2024) { // Allow 2024 for past trips
                newError = 'Ano da partida deve ser 2024 ou posterior.';
            } else {
                const parsedDate = parseUIDateToDate(datapartida);
                if (!parsedDate) {
                    newError = 'Data de partida inválida (ex: dia/mês incorreto).';
                } else if (mode === 'new' && parsedDate < today) { // Only check if < today for new trips
                    newError = 'Data de partida não pode ser anterior à data atual para novas viagens.';
                }
            }
        }
    }
    
    if (newError !== dataPartidaError) {
        setDataPartidaError(newError);
    }
  }, [formData.datapartida, dataPartidaError, mode]);

  useEffect(() => {
    const { dataretorno, datapartida } = formData;
    let newError: string | null = null;

    if (dataretorno) {
        if (dataretorno.length > 0 && dataretorno.length < 10) {
            newError = 'Data de retorno incompleta (DD/MM/AAAA).';
        } else if (dataretorno.length === 10) {
            const parts = dataretorno.split('/');
            const year = parseInt(parts[2], 10);

            if (year < 2024) { // Allow 2024 for past trips
                newError = 'Ano do retorno deve ser 2024 ou posterior.';
            } else {
                const parsedRetorno = parseUIDateToDate(dataretorno);
                if (!parsedRetorno) {
                    newError = 'Data de retorno inválida (ex: dia/mês incorreto).';
                } else {
                    if (dataPartidaError) { 
                        newError = 'Corrija a data de partida primeiro.';
                    } else if (datapartida && datapartida.length === 10) { 
                        const parsedPartida = parseUIDateToDate(datapartida);
                        if (parsedPartida && parsedRetorno < parsedPartida) {
                            newError = 'Data de retorno não pode ser anterior à data de partida.';
                        }
                    }
                }
            }
        }
    }
    if (newError !== dataRetornoError) {
        setDataRetornoError(newError);
    }
  }, [formData.dataretorno, formData.datapartida, dataPartidaError, dataRetornoError]);


  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dataPartidaError || dataRetornoError) {
        toast({ title: "Erro de Validação", description: "Por favor, corrija os erros nas datas antes de salvar.", variant: "destructive" });
        return;
    }


    setIsLoadingData(true); 

    const dataToSave: Record<string, any> = {};

    const dateFields: Array<keyof ViagensFormData> = ['datapartida', 'dataretorno'];
    const currencyFields: Array<keyof ViagensFormData> = [
        'taxacidade', 'outrastaxasvalor', 'estacionamento', 'taxaguialocal', 'totaldespesastaxas', 'adiantamentotaxas',
        'frete', 'adiantamentotransporte', 'refeicaomotoristaunitario', 'totalrefeicaomotorista', 'deslocamentomotoristaunitario',
        'totaldeslocamentosmotoristas', 'totaldespesasmotoristas', 'adiantamentomotoristas', 'traslado1valor', 'traslado2valor',
        'traslado3valor', 'totaldespesastraslados', 'adiantamentotraslados', 'valordiariaunitario', 'totaldiarias',
        'outrosservicosvalor', 'totaldespesashospedagem', 'adiantamentohospedagem', 'valorpasseios1', 'valorpasseios2',
        'valorpasseios3', 'totaldespesaspasseios', 'adiantamentopasseios', 'brindesunitario', 'brindestotal',
        'extras1valor', 'extras2valor', 'extras3valor', 'totaldespesasbrindeesextras', 'adiantamentobrindes',
        'sorteio1valor', 'sorteio2valor', 'sorteio3valor', 'totaldespesassorteios', 'adiantamentosorteios',
        'despesasdiversas', 'adiantamentodespesasdiversas', 'outrasreceitasvalor', 'despesatotal', 'pontoequilibrio', 'precosugerido',
        'precodefinido', 'receitatotal', 'lucrobruto', 'comissaodivulgacaovalor', 'comissaomaxdivulgacao',
        'lucroliquido', 'despesatotalreal', 'receitatotalreal', 'lucrobrutoreal', 'resultadobruto', 'totaldescontosreal',
        'totalindicacoesreal', 'lucroliquidoreal'
    ];
    const integerFields: Array<keyof ViagensFormData> = [
        'qtdeassentos', 'qtdereservadosguias', 'qtdepromocionais', 'naovendidos', 'qtdenaopagantes', 'qtdepagantes',
        'qtdemotoristas', 'qtdealmocosmotoristas', 'qtdejantasmotoristas', 'qtdedeslocamentosmotoristas',
        'qtdetraslado1', 'qtdetraslado2', 'qtdetraslado3', 'qtdehospedes', 'qtdediarias',
        'qtdepasseios1', 'qtdepasseios2', 'qtdepasseios3', 'qtdebrindes',
        'sorteio1qtde', 'sorteio2qtde', 'sorteio3qtde', 'qtdepagantesresultados',
        'qtdepagantesreal', 'qtdepagantesminimo'
    ];
    const floatFields: Array<keyof ViagensFormData> = ['comissaodivulgacao', 'margemdesejada'];
    // whatsappguialocal is already in E.164 format from TaxasSection
    const phoneFields: Array<keyof ViagensFormData> = ['whatsappguia', 'whatsapptransporte', 'whatsapphospedagem'];
    const e164PhoneFields: Array<keyof ViagensFormData> = ['whatsappguialocal'];
    
    const textSelectFields: Array<keyof ViagensFormData> = ['cidadetransporte', 'cidadehospedagem', 'tipoveiculo', 'regimehospedagem', 'empresatransporte', 'empresahospedagem']; 

    for (const key of Object.keys(initialViagensFormData) as Array<keyof ViagensFormData>) {
        if (key === 'id') continue; 

        const formValue = formData[key];
        let valueToSave: any = null; 

        if (dateFields.includes(key)) {
            valueToSave = convertDateToSupabaseFormat(String(formValue));
        } else if (currencyFields.includes(key)) {
            const numVal = parseBRLCurrency(String(formValue));
            valueToSave = numVal === null ? 0 : numVal; 
        } else if (integerFields.includes(key)) {
            const numVal = parseInt(String(formValue), 10);
            valueToSave = isNaN(numVal) ? 0 : numVal; 
        } else if (floatFields.includes(key)) {
            const strVal = String(formValue); 
            let numVal = parseFloat(strVal.replace(',', '.')); // Handles if user types "30,0" for example
            
            if (isNaN(numVal)) {
                 if (key === 'margemdesejada') numVal = 30; 
                 else if (key === 'comissaodivulgacao') numVal = 10;
                 else numVal = 0.0;
            }
            valueToSave = numVal / 100;
        } else if (phoneFields.includes(key)) {
            // Regular phone fields - just remove non-digits
            valueToSave = String(formValue).replace(/\D/g, '') || null;
        } else if (e164PhoneFields.includes(key)) {
            // whatsappguialocal should already be in E.164 format from TaxasSection
            valueToSave = String(formValue) || null;
        } else if (key === 'tipoveiculo') { 
            const trimmedValue = (formValue || '').toString().trim(); 
            valueToSave = formData.empresatransporte ? trimmedValue : null; 
        }
         else if (textSelectFields.includes(key)) { 
            const processedValue = (formValue || '').trim();
            valueToSave = processedValue === '' ? null : processedValue;
        } else { 
            const processedValue = (formValue || '').trim();
            valueToSave = processedValue === '' ? null : processedValue;
        }
        dataToSave[key] = valueToSave;
    }
    
    if (dataToSave.empresatransporte && (dataToSave.tipoveiculo === null || dataToSave.tipoveiculo === '')) {
        dataToSave.tipoveiculo = '';
    }


    try {
        let error = null;
        let successMessage = "";

        // Sanitize dataToSave before sending to Supabase
        const sanitizedData = sanitizeFormData(dataToSave, ['id', 'datapartida', 'dataretorno', 'qtdemotos', 'qtdemotoristas', 'qtdediariastotal', 'qtdealmocomotoristas', 'qtdejantasmotoristas', 'qtdedeslocamentos', 'qtdepassageiros', 'precodefinido', 'totaldespesastaxas', 'adiantamentotaxas', 'totaldespesasmotoristas', 'adiantamentomotoristas', 'totalrefeicaomotorista', 'totaldeslocamentosmotoristas', 'totaldespesastraslados', 'adiantamentotraslados', 'totaldiarias', 'totaldespesashospedagem', 'adiantamentohospedagem', 'totaldespesaspasseios', 'adiantamentopasseios', 'brindestotal', 'totalbrindes', 'comissaodivulgacaovalor', 'outrasreceitasvalor', 'outrastaxasvalor', 'refeicaomotoristaunitario', 'deslocamentomotoristaunitario', 'taxacidade', 'estacionamento', 'taxaguialocal', 'frete', 'traslado1valor', 'traslado2valor', 'traslado3valor', 'valordiariaunitario', 'outrosservicosvalor', 'valorpasseios1', 'valorpasseios2', 'valorpasseios3', 'brindesunitario', 'despesasdiversas', 'adiantamentodespesasdiversas']);

        if (mode === 'edit' && formData.id) {
            const { error: updateError } = await supabase
                .from('viagens')
                .update(sanitizedData)
                .eq('id', formData.id);
            error = updateError;
            successMessage = "Viagem atualizada com sucesso!";
        } else {
            const { data: insertedData, error: insertError } = await supabase
                .from('viagens')
                .insert(sanitizedData as any)
                .select()
                .single();
            error = insertError;
            if (!error && insertedData) {
                setFormData(prev => ({...prev, id: insertedData.id })); 
                setLastLoadedViagemId(insertedData.id); // Update last loaded ID on new save
                successMessage = "Viagem salva com sucesso!";
            } else if (!error) {
                successMessage = "Viagem salva, mas ID não retornado."; 
            }
        }

        if (error) {
            throw error;
        }
        toast({ title: "Sucesso!", description: successMessage, variant: "default" });
        onSaveSuccess();

    } catch (error: any) {
        console.error("Erro ao salvar viagem:", error);
        toast({ title: `Erro ao ${mode === 'edit' ? 'Atualizar' : 'Salvar'}`, description: error.message, variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  }, [formData, mode, onSaveSuccess, toast, dataPartidaError, dataRetornoError]);

  const handleDelete = async () => {
    if (mode !== 'edit' || !formData.id) {
        toast({title: "Ação Inválida", description: "Nenhuma viagem selecionada para excluir.", variant: "warning"});
        return;
    }

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a viagem "${formData.destino}"? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsLoadingData(true);
    try {
        const { error } = await supabase.from('viagens').delete().eq('id', formData.id);
        if (error) throw error;
        toast({ title: "Viagem Excluída", description: `A viagem "${formData.destino}" foi excluída.` });
        onSaveSuccess(); 
    } catch (error: any) {
        toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  };

  const expenseStyle = "font-bold text-red-500";
  const revenueStyle = "font-bold text-blue-900";
  const lucroLiquidoStyle = "font-bold text-blue-900"; 
  const lucroLiquidoRealStyle = "font-bold text-blue-900"; 

  if (isLoadingData && mode === 'edit' && !formData.id && viagemIdToLoad && viagemIdToLoad !== lastLoadedViagemId) { 
    return <div className="text-center p-10 text-lg font-semibold animate-pulse">Carregando dados da viagem...</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InformacoesGeraisSection
          formData={formData}
          handleChange={handleChange}
          dataPartidaError={dataPartidaError}
          dataRetornoError={dataRetornoError}
          disabled={isLoadingData} // General disable for non-date fields if form is loading
          dateFieldsDisabled={computedDateFieldsDisabled} // Specific for date fields
        />
        <TaxasSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <TransporteSection
            formData={formData}
            handleChange={handleChange}
            cidadeTransporteOptions={cidadeTransporteOptions}
            isLoadingCidadeTransporte={isLoadingCidadeTransporte}
            empresaTransporteOptions={empresaTransporteOptions}
            isLoadingEmpresaTransporte={isLoadingEmpresaTransporte}
            tipoVeiculoOptions={tipoVeiculoOptions}
            expenseStyle={expenseStyle}
            disabled={isLoadingData || isLoadingCidadeTransporte || isLoadingEmpresaTransporte}
        />
        <MotoristasSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <TrasladosSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <HospedagemSection
            formData={formData}
            handleChange={handleChange}
            cidadeHospedagemOptions={cidadeHospedagemOptions}
            isLoadingCidadeHospedagem={isLoadingCidadeHospedagem}
            empresaHospedagemOptions={empresaHospedagemOptions}
            isLoadingEmpresaHospedagem={isLoadingEmpresaHospedagem}
            expenseStyle={expenseStyle}
            disabled={isLoadingData || isLoadingCidadeHospedagem || isLoadingEmpresaHospedagem}
        />
        <PasseiosIngressosSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <BrindesExtrasSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <SorteiosSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <OutrasDespesasSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            disabled={isLoadingData}
        />
        <OutrasReceitasSection
            formData={formData}
            handleChange={handleChange}
            revenueStyle={revenueStyle}
            disabled={isLoadingData}
        />
        <ResultadosEstimativaSection
            formData={formData}
            handleChange={handleChange}
            lucroLiquidoStyle={lucroLiquidoStyle}
            disabled={isLoadingData}
        />
        <ResultadosRealSection
            formData={formData}
            handleChange={handleChange}
            expenseStyle={expenseStyle}
            revenueStyle={revenueStyle}
            lucroLiquidoRealStyle={lucroLiquidoRealStyle}
            disabled={isLoadingData}
        />

        {/* Botões */}
        <div className="flex flex-wrap justify-end pt-4 border-t mt-6 gap-2">
  {mode === 'edit' && (
    <div className="mb-2 mr-0 md:mr-3">
      <button type="button" onClick={handleDelete} disabled={isLoadingData || !formData.id} className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50">
        Excluir
      </button>
    </div>
  )}
  <div className="mb-2">
    <button type="submit" disabled={isLoadingData || dataPartidaError !== null || dataRetornoError !== null} className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50">
      {isLoadingData ? 'Salvando...' : (mode === 'edit' ? 'Atualizar' : 'Salvar')}
    </button>
  </div>
</div>
      </form>
    </div>
  );
};
export default ViagensForm;
