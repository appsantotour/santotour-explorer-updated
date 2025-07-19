
import React, { useState, useCallback, useEffect } from 'react';
import { ClientFormData, FormFieldName } from '../../types';
import InputField from '../InputField';
import SelectField from '../SelectField'; // Import SelectField
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { applyCpfMask, applyPhoneMask } from '@/utils/maskUtils';
import { convertDateToSupabaseFormat, convertDateFromSupabaseFormat } from '@/utils/dateUtils';
import { sanitizeFormData } from '@/utils/sanitizationUtils';

interface Option {
  value: string;
  label: string;
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

const ClientForm: React.FC = () => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);
  const [indicadorCpfError, setIndicadorCpfError] = useState<string | null>(null);
  const [isLoadingIndicadorCpf, setIsLoadingIndicadorCpf] = useState(false);
  const { toast } = useToast();

  const [localEmbarqueOptions, setLocalEmbarqueOptions] = useState<Option[]>([{ value: '', label: 'Selecione um local' }]);
  const [isLoadingLocaisEmbarque, setIsLoadingLocaisEmbarque] = useState(false);

  // Fetch locais de embarque for SelectField
  useEffect(() => {
    const fetchLocaisEmbarque = async () => {
      setIsLoadingLocaisEmbarque(true);
      const { data, error } = await supabase
        .from('locais_embarque')
        .select('localembarque')
        .eq('ativo', true)
        .order('localembarque', { ascending: true });

      if (error) {
        toast({ title: "Erro ao buscar Locais", description: error.message, variant: "destructive" });
        setLocalEmbarqueOptions([{ value: '', label: 'Erro ao carregar' }]);
      } else if (data) {
        const distinctLocais = [...new Set(data.map(item => item.localembarque).filter(Boolean))];
        const options = distinctLocais.map(local => ({ value: local as string, label: local as string }));
        setLocalEmbarqueOptions([{ value: '', label: 'Selecione um local' }, ...options]);
      }
      setIsLoadingLocaisEmbarque(false);
    };
    fetchLocaisEmbarque();
  }, [toast]);

  // Auto-fill enderecoembarque based on localembarque selection
  useEffect(() => {
    const fetchEnderecoEmbarque = async () => {
      if (!formData.localembarque) {
        if (formData.localembarque === '') { // Clear endereco if local is cleared
            setFormData(prev => ({ ...prev, enderecoembarque: '' }));
        }
        return;
      }
      // console.log("Fetching address for local:", formData.localembarque);
      const { data, error } = await supabase
        .from('locais_embarque')
        .select('enderecoembarque')
        .eq('localembarque', formData.localembarque)
        .limit(1) // Pick one if multiple (ideally localembarque name is unique for this purpose or handled)
        .single(); 

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, not necessarily an error here
        toast({ title: "Erro Endereço", description: `Não foi possível buscar endereço: ${error.message}`, variant: "warning" });
        setFormData(prev => ({ ...prev, enderecoembarque: '' })); // Clear if error
      } else if (data) {
        // console.log("Address fetched:", data.enderecoembarque);
        setFormData(prev => ({ ...prev, enderecoembarque: data.enderecoembarque || '' }));
      } else {
        // console.log("No address found for local:", formData.localembarque);
        setFormData(prev => ({ ...prev, enderecoembarque: '' })); // Clear if no address found
      }
    };

    fetchEnderecoEmbarque();
  }, [formData.localembarque, toast]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cpf' && !value && isEditing) {
      setFormData(initialFormData);
      setIsEditing(false);
      toast({ title: "Formulário Resetado", description: "CPF foi removido, formulário pronto para novo cliente.", variant: "default" });
      return;
    }
    
    if (name === 'indicadopor' && !value) {
        setFormData(prev => ({
            ...prev,
            indicadopor: '',
            nomeindicadopor: '', 
        }));
        setIndicadorCpfError(null); 
        return; 
    }
    
    // If localembarque is cleared, ensure enderecoembarque is also cleared (handled by useEffect on localembarque too)
    if (name === 'localembarque' && !value) {
      setFormData(prev => ({
        ...prev,
        localembarque: '',
        enderecoembarque: '', // Explicitly clear address here as well for immediate feedback
        [name as FormFieldName]: value, // Set the localembarque itself
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as FormFieldName]: value,
      }));
    }

  }, [isEditing, toast]);

  useEffect(() => {
    const unmaskedCpf = formData.cpf.replace(/\D/g, '');
    if (isEditing && unmaskedCpf.length > 0 && unmaskedCpf.length < 11) {
      const currentCpfInForm = formData.cpf; 
      setFormData(_prev => ({
        ...initialFormData,
        cpf: currentCpfInForm,
        id: undefined,
      }));
      setIsEditing(false);
      toast({ title: "CPF Principal Incompleto", description: "Formulário resetado para novo cadastro.", variant: "warning" });
      return;
    }

    const debounceTimer = setTimeout(() => {
      const currentUnmaskedCpfAfterDebounce = formData.cpf.replace(/\D/g, '');
      if (currentUnmaskedCpfAfterDebounce.length === 11) {
        checkCpfQuery(currentUnmaskedCpfAfterDebounce);
      }
    }, 600);
    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cpf]); 


  useEffect(() => {
    const unmaskedIndicadorCpf = formData.indicadopor?.replace(/\D/g, '') || '';
    if (unmaskedIndicadorCpf.length === 0) {
      setFormData(prev => ({ ...prev, nomeindicadopor: '' }));
      if (indicadorCpfError) setIndicadorCpfError(null); 
      return;
    }
    if (unmaskedIndicadorCpf.length < 11) {
      setFormData(prev => ({ ...prev, nomeindicadopor: '' }));
      if (indicadorCpfError) setIndicadorCpfError(null);
      return;
    }
    const debounceTimerIndicador = setTimeout(() => {
        const currentUnmaskedIndicadorCpfAfterDebounce = formData.indicadopor?.replace(/\D/g, '') || '';
        if (currentUnmaskedIndicadorCpfAfterDebounce.length === 11) {
            checkIndicadorCpfQuery(currentUnmaskedIndicadorCpfAfterDebounce);
        } else {
             if (indicadorCpfError) setIndicadorCpfError(null);
             setFormData(prev => ({ ...prev, nomeindicadopor: '' }));
        }
    }, 600);
    return () => clearTimeout(debounceTimerIndicador);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.indicadopor]); 

  const checkCpfQuery = async (cpfToQuery: string) => {
    setIsLoadingCpf(true);
    try {
      const { data, error } = await supabase.from('clientes').select('*').eq('cpf', cpfToQuery).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        // The localembarque value from DB will trigger the useEffect to fetch enderecoembarque
        setFormData({
          id: data.id,
          cpf: applyCpfMask(data.cpf || ''), 
          nome: data.nome || '',
          telefone: data.telefone ? applyPhoneMask(data.telefone) : '',
          datanascimento: convertDateFromSupabaseFormat(data.datanascimento),
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          localembarque: data.localembarque || '', // This will trigger enderecoembarque fetch
          enderecoembarque: data.enderecoembarque || '', // Temporarily set, will be re-fetched
          indicadopor: data.indicadopor ? applyCpfMask(data.indicadopor) : '',
          nomeindicadopor: data.nomeindicadopor || '',
          observacoes: data.observacoes || '',
        });
        setIsEditing(true);
        toast({ title: "Cliente Encontrado", description: "Dados carregados no formulário." });
      } else {
        const currentCpfInForm = formData.cpf; 
        setFormData(prev => ({
            ...initialFormData,
            cpf: currentCpfInForm, id: undefined,
            nome: prev.cpf === currentCpfInForm ? prev.nome : '',
            telefone: prev.cpf === currentCpfInForm ? prev.telefone : '',
            datanascimento: prev.cpf === currentCpfInForm ? prev.datanascimento : '',
            bairro: prev.cpf === currentCpfInForm ? prev.bairro : '',
            cidade: prev.cpf === currentCpfInForm ? prev.cidade : '',
            localembarque: prev.cpf === currentCpfInForm ? prev.localembarque : '',
            enderecoembarque: prev.cpf === currentCpfInForm ? prev.enderecoembarque : '', // Keep if CPF didn't change from typed state
            indicadopor: prev.indicadopor, 
            nomeindicadopor: prev.nomeindicadopor,
            observacoes: prev.cpf === currentCpfInForm ? prev.observacoes : '',
          }));
        setIsEditing(false);
        toast({ title: "Novo Cliente", description: "CPF não encontrado. Prossiga com o cadastro." });
      }
    } catch (err: any) {
      toast({ title: "Erro na Consulta", description: `Falha ao verificar CPF: ${err.message}`, variant: "destructive" });
      setIsEditing(false);
      const currentCpfInForm = formData.cpf; 
      setFormData({ ...initialFormData, cpf: currentCpfInForm, id: undefined });
    } finally {
      setIsLoadingCpf(false);
    }
  };

  const checkIndicadorCpfQuery = async (cpfToQuery: string) => {
    setIsLoadingIndicadorCpf(true);
    setIndicadorCpfError(null); 
    try {
      const { data, error } = await supabase.from('clientes').select('nome').eq('cpf', cpfToQuery).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setFormData(prev => ({ ...prev, nomeindicadopor: data.nome || '' }));
        setIndicadorCpfError(null);
        toast({ title: "Indicador Encontrado", description: `Nome: ${data.nome}` });
      } else {
        setIndicadorCpfError("Cadastre o indicador como cliente primeiro.");
        setFormData(prev => ({ ...prev, nomeindicadopor: '' }));
        toast({ title: "Indicador Não Encontrado", description: "O CPF do indicador não foi encontrado.", variant: "warning" });
      }
    } catch (err: any) {
      setIndicadorCpfError(`Erro ao verificar CPF do indicador.`);
      toast({ title: "Erro (Indicador)", description: `Falha ao verificar CPF do indicador.`, variant: "destructive" });
      setFormData(prev => ({ ...prev, nomeindicadopor: '' }));
    } finally {
      setIsLoadingIndicadorCpf(false);
    }
  };

  const handleClearForm = useCallback(() => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIndicadorCpfError(null);
    toast({ 
      title: "Formulário Limpo", 
      description: "Pronto para cadastrar um novo cliente.",
      variant: "default"
    });
  }, [toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const unmaskedCpfToSave = formData.cpf.replace(/\D/g, '');
    const unmaskedIndicadorCpfToSave = formData.indicadopor?.replace(/\D/g, '') || null;
    const unmaskedTelefoneToSave = formData.telefone?.replace(/\D/g, '') || null;

    if (!unmaskedCpfToSave || !formData.nome || !formData.bairro || !formData.cidade) {
      toast({ 
        title: "Campos Obrigatórios", 
        description: "Por favor, preencha todos os campos obrigatórios: CPF, Nome, Bairro e Cidade.", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
      return;
    }
     if (unmaskedCpfToSave.length !== 11) {
      toast({ title: "CPF Principal Inválido", description: "O CPF principal deve conter 11 dígitos.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (unmaskedIndicadorCpfToSave && unmaskedIndicadorCpfToSave.length === 11 && indicadorCpfError) {
        toast({ title: "CPF do Indicador Inválido", description: indicadorCpfError, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    if (unmaskedIndicadorCpfToSave && unmaskedIndicadorCpfToSave.length > 0 && unmaskedIndicadorCpfToSave.length < 11) {
        toast({ title: "CPF do Indicador Incompleto", description: "Verifique o CPF de quem indicou.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    const submissionData = sanitizeFormData({
      cpf: unmaskedCpfToSave,
      nome: formData.nome,
      telefone: unmaskedTelefoneToSave,
      datanascimento: convertDateToSupabaseFormat(formData.datanascimento),
      bairro: formData.bairro,
      cidade: formData.cidade,
      localembarque: formData.localembarque || null,
      enderecoembarque: formData.enderecoembarque || null,
      indicadopor: unmaskedIndicadorCpfToSave,
      nomeindicadopor: unmaskedIndicadorCpfToSave && !indicadorCpfError ? formData.nomeindicadopor : null,
      observacoes: formData.observacoes || null,
    }, ['cpf', 'telefone', 'datanascimento', 'indicadopor']);
    let error = null;
    if (isEditing && formData.id) {
      const { error: updateError } = await supabase.from('clientes').update(submissionData).eq('id', formData.id);
      error = updateError;
    } else {
      const { data: insertedData, error: insertError } = await supabase.from('clientes').insert([submissionData]).select().single();
      error = insertError;
      if (!error && insertedData) {
        setFormData({ 
            id: insertedData.id,
            cpf: applyCpfMask(insertedData.cpf || ''),
            nome: insertedData.nome || '',
            telefone: insertedData.telefone ? applyPhoneMask(insertedData.telefone) : '',
            datanascimento: convertDateFromSupabaseFormat(insertedData.datanascimento),
            bairro: insertedData.bairro || '',
            cidade: insertedData.cidade || '',
            localembarque: insertedData.localembarque || '',
            enderecoembarque: insertedData.enderecoembarque || '',
            indicadopor: insertedData.indicadopor ? applyCpfMask(insertedData.indicadopor) : '',
            nomeindicadopor: insertedData.nomeindicadopor || '',
            observacoes: insertedData.observacoes || '',
        });
        setIsEditing(true); 
        setIndicadorCpfError(null); 
        toast({
          title: "Sucesso",
          description: 'Cliente cadastrado com sucesso!'
        });
      } else if (!error) {
        toast({
          title: "Sucesso",
          description: 'Cliente cadastrado, mas ID não retornado.'
        });
        handleClearForm();
      }
    }
    if (error) {
      toast({ 
        title: `Erro ao ${isEditing ? 'Atualizar' : 'Cadastrar'}`, 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      // Sincronizar campos de indicação entre clientes e passageiros
      if (unmaskedCpfToSave) {
        try {
          // Atualiza todos os passageiros cujo cpfpassageiro == cpf do cliente
          const { error: syncError } = await supabase
            .from('passageiros')
            .update({
              cpfindicador: unmaskedIndicadorCpfToSave || null,
              nomeindicador: formData.nomeindicadopor || null
            })
            .eq('cpfpassageiro', unmaskedCpfToSave);

          if (syncError) {
            console.error('Erro ao sincronizar dados de indicação para passageiros:', syncError);
          } else {
            console.log(`Campos de indicação sincronizados para passageiros com cpfpassageiro=${unmaskedCpfToSave}`);
          }
        } catch (syncError) {
          console.error('Erro na sincronização:', syncError);
          // Continua com mensagem de sucesso para o cliente
        }
      }

      toast({ 
        title: isEditing ? "Atualização Concluída" : "Cadastro Realizado",
        description: isEditing 
          ? "Os dados do cliente foram atualizados com sucesso!"
          : "Cliente cadastrado com sucesso!",
        variant: "default"
      });
    }
    setIsSubmitting(false);
  }, [formData, isEditing, toast, indicadorCpfError, handleClearForm]);

  const handleDelete = useCallback(async () => {
    if (!isEditing || !formData.id) {
      toast({ title: "Ação Inválida", description: "Nenhum cliente selecionado para excluir.", variant: "warning" });
      return;
    }
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o cliente ${formData.nome} (CPF: ${formData.cpf})? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('clientes').delete().eq('id', formData.id);
    if (error) {
      toast({ 
        title: "Erro ao Excluir", 
        description: `Não foi possível excluir o cliente: ${error.message}`, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Cliente Excluído", 
        description: `O cliente ${formData.nome} foi removido do sistema.`,
        variant: "default"
      });
      handleClearForm(); 
    }
    setIsSubmitting(false);
  }, [isEditing, formData, toast, handleClearForm]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6 p-2">
          {/* Linha 1 */}
          <div className="md:col-span-1 relative">
            <InputField
              id="cpf"
              name="cpf"
              label="CPF"
              value={formData.cpf}
              onChange={handleChange}
              maxLength={14}
              required
              maskType="cpf"
            />
            {isLoadingCpf && <span className="absolute top-0 right-0 mt-1 mr-1 text-xs text-blue-500 animate-pulse">Verificando...</span>}
          </div>
          <InputField
            id="nome"
            name="nome"
            label="Nome Completo"
            value={formData.nome}
            onChange={handleChange}
            required
            className="md:col-span-3" 
          />
          <InputField
            id="telefone"
            name="telefone"
            label="Telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            maxLength={15} 
            maskType="phone"
            className="md:col-span-1"
          />
          <InputField
            id="datanascimento"
            name="datanascimento"
            label="Data de Nascimento"
            type="text"
            value={formData.datanascimento || ''}
            onChange={handleChange}
            maxLength={10}
            maskType="date"
            placeholder="DD/MM/AAAA"
            className="md:col-span-1"
          />

          {/* Linha 2 */}
          <InputField
            id="bairro"
            name="bairro"
            label="Bairro"
            value={formData.bairro}
            onChange={handleChange}
            required
            className="md:col-span-1"
          />
          <InputField
            id="cidade"
            name="cidade"
            label="Cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
            className="md:col-span-1"
          />
          <SelectField
            id="localembarque"
            name="localembarque"
            label="Local de Embarque"
            value={formData.localembarque || ''}
            onChange={handleChange}
            options={localEmbarqueOptions}
            disabled={isLoadingLocaisEmbarque}
            className="md:col-span-1"
          />
          <InputField
            id="enderecoembarque"
            name="enderecoembarque"
            label="Endereço de Embarque"
            value={formData.enderecoembarque || ''}
            onChange={handleChange}
            className="md:col-span-3"
            readOnly={!!formData.localembarque} // Read-only if a local de embarque is selected
            placeholder={!!formData.localembarque ? 'Automático' : 'Digite ou selecione um local'}
          />
          
          {/* Linha 3 - Indicador */}
          <div className="md:col-span-1 relative">
            <InputField
              id="indicadopor"
              name="indicadopor"
              label="CPF de Quem Indicou"
              value={formData.indicadopor || ''}
              onChange={handleChange}
              maxLength={14}
              maskType="cpf"
              className="w-full"
            />
            {isLoadingIndicadorCpf && <span className="absolute top-0 right-0 mt-1 mr-1 text-xs text-blue-500 animate-pulse">Verificando...</span>}
             {indicadorCpfError && <p className="text-xs text-red-600 mt-1">{indicadorCpfError}</p>}
          </div>
          <InputField
            id="nomeindicadopor"
            name="nomeindicadopor"
            label="Nome de Quem Indicou"
            value={formData.nomeindicadopor || ''}
            onChange={handleChange} 
            readOnly={isLoadingIndicadorCpf || (!!formData.indicadopor && !indicadorCpfError)}
            className="md:col-span-2"
          />
          <InputField
            id="observacoes"
            name="observacoes"
            label="Observações"
            value={formData.observacoes || ''}
            onChange={handleChange}
            isTextArea={false}
            maxLength={100}
            className="md:col-span-3" 
          />
        </div>

        <div className="flex flex-wrap justify-end pt-4 gap-2">
  <div className="mb-2 mr-0 md:mr-3">
    <button
      type="submit"
      disabled={isSubmitting || isLoadingCpf || isLoadingIndicadorCpf || isLoadingLocaisEmbarque}
      aria-label={isEditing ? 'Atualizar dados do cliente' : 'Cadastrar novo cliente'}
      className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
    </button>
  </div>
  <div className="mb-2">
    <button
      type="button"
      onClick={handleDelete}
      disabled={isSubmitting || isLoadingCpf || isLoadingIndicadorCpf || !isEditing || !formData.id}
      aria-label="Excluir cliente selecionado"
      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-100 disabled:cursor-not-allowed">
      Excluir
    </button>
  </div>
</div>
      </form>
    </div>
  );
};

export default ClientForm;
