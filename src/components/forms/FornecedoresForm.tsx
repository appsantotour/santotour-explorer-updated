
import React, { useState, useCallback, useEffect } from 'react';
import { FornecedoresFormData, FornecedoresFormFieldName, EstadoBrasil, TipoHospedagemOpcao } from '../../types';
import InputField from '../InputField';
import CheckboxField from '../CheckboxField';
import SelectField from '../SelectField';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { applyPhoneMask } from '../../utils/maskUtils'; // Importar applyPhoneMask
import { sanitizeFormData } from '../../utils/sanitizationUtils';
import { Trash2, Edit3, PlusCircle } from 'lucide-react'; // Icons

const initialFormData: FornecedoresFormData = {
  id: undefined,
  fornecedor_selecionado_id: undefined, // Para o select
  nome_fornecedor: '',
  nome_contato: '',
  telefone: '',
  whatsapp: '',
  estado: '',
  cidade: '',
  fretamento: false,
  onibus: false,
  semi_leito: false,
  microonibus: false,
  van: false,
  carro: false,
  hospedagem: false,
  tipohospedagem: '',
  guias: false,
  passeios: false,
  ingressos: false,
  estacionamentos: false,
  brindes: false,
  observacoes: '',
  ativo: true, // Default para novo fornecedor
};

interface Option {
  value: string;
  label: string;
}

const FornecedoresForm: React.FC = () => {
  const [formData, setFormData] = useState<FornecedoresFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fornecedoresOptions, setFornecedoresOptions] = useState<Option[]>([
    { value: '', label: 'Selecione para editar ou cadastre um novo' }
  ]);
  const { toast } = useToast();

  const fetchFornecedoresForDropdown = useCallback(async () => {
    // Remove Supabase configuration check since it's always configured
    setIsLoadingOptions(true);
    const { data, error } = await supabase
      .from('fornecedores')
      .select('id, nome_fornecedor, cidade')
      .order('nome_fornecedor', { ascending: true });

    if (error) {
      toast({ title: "Erro ao buscar Fornecedores", description: error.message, variant: "destructive" });
      setFornecedoresOptions([{ value: '', label: 'Erro ao carregar' }]);
    } else {
      const options = data.map(f => ({
        value: f.id.toString(),
        label: `${f.nome_fornecedor} (${f.cidade || 'Cidade não informada'})`,
      }));
      setFornecedoresOptions([{ value: '', label: 'Selecione para editar ou cadastre um novo' }, ...options]);
    }
    setIsLoadingOptions(false);
  }, [toast]);

  useEffect(() => {
    fetchFornecedoresForDropdown();
  }, [fetchFornecedoresForDropdown]);

  // Carregar dados quando um fornecedor é selecionado
  useEffect(() => {
    const loadSelectedFornecedor = async () => {
      if (!formData.fornecedor_selecionado_id) {
        if (!formData.fornecedor_selecionado_id && isEditing) {
            // Reset if selection is cleared while in edit mode based on a previous selection
            setFormData(initialFormData);
            setIsEditing(false);
        }
        return;
      }
      setIsLoadingData(true);
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', parseInt(formData.fornecedor_selecionado_id?.toString() || '0'))
        .single();

      if (error) {
        toast({ title: "Erro ao Carregar Fornecedor", description: error.message, variant: "destructive" });
        setFormData(initialFormData); // Reset to avoid inconsistent state
        setIsEditing(false);
      } else if (data) {
        setFormData({
          id: data.id,
          fornecedor_selecionado_id: data.id, // Keep the select field synced
          nome_fornecedor: data.nome_fornecedor || '',
          nome_contato: data.nome_contato || '',
          telefone: data.telefone ? applyPhoneMask(data.telefone) : '',
          whatsapp: data.whatsapp ? applyPhoneMask(data.whatsapp) : '',
          estado: data.estado || '',
          cidade: data.cidade || '',
          fretamento: data.fretamento || false,
          onibus: data.onibus || false,
          semi_leito: data.semi_leito || false,
          microonibus: data.microonibus || false,
          van: data.van || false,
          carro: data.carro || false,
          hospedagem: data.hospedagem || false,
          tipohospedagem: data.tipohospedagem || '',
          guias: data.guias || false,
          passeios: data.passeios || false,
          ingressos: data.ingressos || false,
          estacionamentos: data.estacionamentos || false,
          brindes: data.brindes || false,
          observacoes: data.observacoes || '',
          ativo: data.ativo === null ? true : data.ativo, // Default to true if null
        });
        setIsEditing(true);
        toast({ title: "Fornecedor Carregado", description: "Dados preenchidos no formulário." });
      }
      setIsLoadingData(false);
    };
    loadSelectedFornecedor();
  }, [formData.fornecedor_selecionado_id, toast, isEditing]);


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Se o usuário começar a digitar nome_fornecedor e já estiver em modo de edição,
    // e o evento não for do select de fornecedores,
    // assumir que é um novo cadastro.
    if (name === 'nome_fornecedor' && isEditing && formData.id) {
        const currentName = value;
        // Check if the current name in form is different from the loaded name,
        // or if the select field is not the source of this change.
        // This logic helps determine if the user is typing a new name over an existing one.
        const loadedFornecedorOption = fornecedoresOptions.find(opt => opt.value === formData.fornecedor_selecionado_id?.toString());
        const loadedName = loadedFornecedorOption ? loadedFornecedorOption.label.split(' (')[0] : '';

        if (currentName !== loadedName) { // Or a more robust check if needed
            setFormData(prev => ({
                ...initialFormData,
                nome_fornecedor: currentName, 
                // Preserve other fields if user might be filling them for the new entry
                nome_contato: prev.nome_fornecedor === currentName ? prev.nome_contato : '',
                telefone: prev.nome_fornecedor === currentName ? prev.telefone : '',
                whatsapp: prev.nome_fornecedor === currentName ? prev.whatsapp : '',
                estado: prev.nome_fornecedor === currentName ? prev.estado : '',
                cidade: prev.nome_fornecedor === currentName ? prev.cidade : '',
                // Reset boolean/service fields for a truly new entry
            }));
            setIsEditing(false); // Switch to "new" mode effectively
            // Consider clearing fornecedor_selecionado_id to deselect from dropdown
            // setFormData(prev => ({ ...prev, fornecedor_selecionado_id: '' })); 
            toast({ title: "Novo Cadastro", description: "Modo de edição desativado para criar novo fornecedor.", variant:"default" });
        } else {
             setFormData(prev => ({
                ...prev,
                [name as FornecedoresFormFieldName]: value,
            }));
        }
    } else {
        setFormData(prev => ({
            ...prev,
            [name as FornecedoresFormFieldName]: value,
        }));
    }
  }, [isEditing, formData.id, formData.fornecedor_selecionado_id, fornecedoresOptions, toast]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name as FornecedoresFormFieldName]: checked } as FornecedoresFormData;
      if (name === 'fretamento' && !checked) {
        newState.onibus = false;
        newState.semi_leito = false;
        newState.microonibus = false;
        newState.van = false;
        newState.carro = false;
      }
      if (name === 'hospedagem' && !checked) {
        newState.tipohospedagem = '';
      }
      return newState;
    });
  }, []);

  const handleClearForm = useCallback(() => {
    setFormData(initialFormData);
    setIsEditing(false);
    toast({ title: "Formulário Limpo", description: "Pronto para novo cadastro." });
  }, [toast]);

  const validateForm = (): boolean => {
    const { nome_fornecedor, nome_contato, estado, cidade } = formData;
    if (!nome_fornecedor.trim() || nome_fornecedor.length < 3) {
      toast({ title: "Validação Falhou", description: "Nome do fornecedor é obrigatório (mín. 3 caracteres).", variant: "warning" });
      return false;
    }
    if (!nome_contato.trim() || nome_contato.length < 3) {
      toast({ title: "Validação Falhou", description: "Nome do contato é obrigatório (mín. 3 caracteres).", variant: "warning" });
      return false;
    }
    const telefoneDigits = formData.telefone.replace(/\D/g, '');
    if (telefoneDigits.length > 0 && (telefoneDigits.length < 10 || telefoneDigits.length > 11)) {
      toast({ title: "Validação Falhou", description: "Telefone inválido.", variant: "warning" });
      return false;
    }
    const whatsappDigits = formData.whatsapp.replace(/\D/g, '');
    if (whatsappDigits.length > 0 && (whatsappDigits.length < 10 || whatsappDigits.length > 11)) {
      toast({ title: "Validação Falhou", description: "WhatsApp inválido.", variant: "warning" });
      return false;
    }
    if (!estado) {
      toast({ title: "Validação Falhou", description: "Estado é obrigatório.", variant: "warning" });
      return false;
    }
    if (!cidade.trim() || cidade.length < 2) {
      toast({ title: "Validação Falhou", description: "Cidade é obrigatória (mín. 2 caracteres).", variant: "warning" });
      return false;
    }
    return true;
  };
  
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsSubmitting(false); // Ensure isSubmitting is reset if validation fails early
      return;
    }

    // Remove Supabase configuration check since it's always configured
    
    setIsSubmitting(true);
    
    const dataToSave = sanitizeFormData({
        nome_fornecedor: formData.nome_fornecedor,
        nome_contato: formData.nome_contato,
        telefone: formData.telefone.replace(/\D/g, '') || null,
        whatsapp: formData.whatsapp.replace(/\D/g, '') || null,
        estado: formData.estado,
        cidade: formData.cidade,
        fretamento: formData.fretamento,
        onibus: formData.fretamento ? formData.onibus : false,
        semi_leito: formData.fretamento ? formData.semi_leito : false,
        microonibus: formData.fretamento ? formData.microonibus : false,
        van: formData.fretamento ? formData.van : false,
        carro: formData.fretamento ? formData.carro : false,
        hospedagem: formData.hospedagem,
        tipohospedagem: formData.hospedagem ? (formData.tipohospedagem || null) : null,
        guias: formData.guias,
        passeios: formData.passeios,
        ingressos: formData.ingressos,
        estacionamentos: formData.estacionamentos,
        brindes: formData.brindes,
        observacoes: formData.observacoes,
        ativo: formData.ativo,
    }, ['telefone', 'whatsapp', 'fretamento', 'onibus', 'semi_leito', 'microonibus', 'van', 'carro', 'hospedagem', 'guias', 'passeios', 'ingressos', 'estacionamentos', 'brindes', 'ativo']);
    
    let error = null;
    let successMessage = "";

    if (isEditing && formData.id) {
      const { error: updateError } = await supabase.from('fornecedores').update(dataToSave).eq('id', formData.id);
      error = updateError;
      successMessage = 'Fornecedor atualizado com sucesso!';
    } else {
      const { data: insertedData, error: insertError } = await supabase.from('fornecedores').insert([dataToSave]).select().single();
      error = insertError;
      if (!error && insertedData) {
        setFormData(prev => ({ 
            ...prev, 
            id: insertedData.id, 
            fornecedor_selecionado_id: insertedData.id, 
        }));
        setIsEditing(true); 
        successMessage = 'Fornecedor salvo com sucesso!';
      } else if (!error) {
         successMessage = 'Fornecedor salvo, mas ID não retornado.'; 
      }
    }

    if (error) {
      toast({ title: `Erro ao ${isEditing ? 'Atualizar' : 'Salvar'}`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: successMessage });
      fetchFornecedoresForDropdown(); 
    }
    
    setIsSubmitting(false);
  }, [formData, isEditing, toast, fetchFornecedoresForDropdown]);

  const handleDelete = useCallback(async () => {
    if (!isEditing || !formData.id) {
      toast({ title: "Ação Inválida", description: "Nenhum fornecedor selecionado para excluir.", variant: "warning" });
      return;
    }
    // Remove Supabase configuration check since it's always configured

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o fornecedor "${formData.nome_fornecedor}"? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('fornecedores').delete().eq('id', formData.id);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Fornecedor Excluído", description: `O fornecedor "${formData.nome_fornecedor}" foi excluído.` });
      handleClearForm();
      fetchFornecedoresForDropdown(); 
    }
  }, [isEditing, formData, toast, handleClearForm, fetchFornecedoresForDropdown]);
  

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
          <SelectField
            id="fornecedor_selecionado_id"
            name="fornecedor_selecionado_id" 
            label="Selecionar Fornecedor"
            value={formData.fornecedor_selecionado_id?.toString() || ''} 
            onChange={handleChange}
            options={fornecedoresOptions}
            disabled={isLoadingOptions || isLoadingData}
            className="md:col-span-2"
          />
        </div>

        {/* Seção DADOS BÁSICOS */}
        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            DADOS BÁSICOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
            <InputField id="nome_fornecedor" name="nome_fornecedor" label="Nome do Fornecedor" value={formData.nome_fornecedor} onChange={handleChange} required maxLength={50} placeholder="Ex: Empresa de Transporte ABC" className="md:col-span-2" disabled={isLoadingData} />
            <InputField id="nome_contato" name="nome_contato" label="Nome do Contato" value={formData.nome_contato} onChange={handleChange} required maxLength={50} placeholder="Ex: João Silva" className="md:col-span-2" disabled={isLoadingData}/>
            <InputField id="telefone" name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} maskType="phone" placeholder="(00) 0000-0000" className="md:col-span-1" disabled={isLoadingData}/>
            <InputField id="whatsapp" name="whatsapp" label="WhatsApp" value={formData.whatsapp} onChange={handleChange} maskType="phone" placeholder="(00) 00000-0000" className="md:col-span-1" disabled={isLoadingData}/>
          </div>
        </div>

        {/* Seção LOCALIZAÇÃO */}
        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            LOCALIZAÇÃO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
            <SelectField id="estado" name="estado" label="Estado" value={formData.estado} onChange={handleChange} options={EstadoBrasil} required className="md:col-span-1" disabled={isLoadingData}/>
            <InputField id="cidade" name="cidade" label="Cidade" value={formData.cidade} onChange={handleChange} required maxLength={50} placeholder="Ex: Campinas" className="md:col-span-2" disabled={isLoadingData}/>
             <CheckboxField
              id="ativo"
              name="ativo"
              label="Fornecedor Ativo"
              checked={formData.ativo}
              onChange={handleCheckboxChange}
              disabled={isLoadingData}
              className="md:col-span-1 mt-6" 
            />
          </div>
        </div>

        {/* Seção SERVIÇOS OFERECIDOS */}
        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            SERVIÇOS OFERECIDOS
          </h2>
          <div className="space-y-3">
            <div>
              <CheckboxField id="fretamento" name="fretamento" label="Fretamento" checked={formData.fretamento} onChange={handleCheckboxChange} disabled={isLoadingData}/>
              {formData.fretamento && (
                <div className="ml-6 mt-2 grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4 border-l-2 border-gray-200 pl-4 py-2">
                  <CheckboxField id="onibus" name="onibus" label="Ônibus" checked={formData.onibus} onChange={handleCheckboxChange} disabled={!formData.fretamento || isLoadingData} />
                  <CheckboxField id="semi_leito" name="semi_leito" label="Ônibus Semi-Leito" checked={formData.semi_leito} onChange={handleCheckboxChange} disabled={!formData.fretamento || isLoadingData} />
                  <CheckboxField id="microonibus" name="microonibus" label="Micro-ônibus" checked={formData.microonibus} onChange={handleCheckboxChange} disabled={!formData.fretamento || isLoadingData} />
                  <CheckboxField id="van" name="van" label="Van" checked={formData.van} onChange={handleCheckboxChange} disabled={!formData.fretamento || isLoadingData} />
                  <CheckboxField id="carro" name="carro" label="Carro Executivo" checked={formData.carro} onChange={handleCheckboxChange} disabled={!formData.fretamento || isLoadingData} />
                </div>
              )}
            </div>
            
            <div>
              <CheckboxField id="hospedagem" name="hospedagem" label="Hospedagem" checked={formData.hospedagem} onChange={handleCheckboxChange} disabled={isLoadingData}/>
              {formData.hospedagem && (
                <div className="ml-6 mt-2 grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4 border-l-2 border-gray-200 pl-4 py-2">
                  <SelectField id="tipohospedagem" name="tipohospedagem" label="Tipo de Hospedagem" value={formData.tipohospedagem} onChange={handleChange} options={TipoHospedagemOpcao} disabled={!formData.hospedagem || isLoadingData} className="md:col-span-2" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4 pt-2">
                <CheckboxField id="guias" name="guias" label="Guias" checked={formData.guias} onChange={handleCheckboxChange} disabled={isLoadingData}/>
                <CheckboxField id="passeios" name="passeios" label="Passeios" checked={formData.passeios} onChange={handleCheckboxChange} disabled={isLoadingData}/>
                <CheckboxField id="ingressos" name="ingressos" label="Ingressos" checked={formData.ingressos} onChange={handleCheckboxChange} disabled={isLoadingData}/>
                <CheckboxField id="estacionamentos" name="estacionamentos" label="Estacionamentos" checked={formData.estacionamentos} onChange={handleCheckboxChange} disabled={isLoadingData}/>
                <CheckboxField id="brindes" name="brindes" label="Brindes" checked={formData.brindes} onChange={handleCheckboxChange} disabled={isLoadingData}/>
            </div>
          </div>
        </div>

        {/* Seção Observações */}
        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            OBSERVAÇÕES
          </h2>
          <InputField
            id="observacoes"
            name="observacoes"
            label="Observações"
            value={formData.observacoes}
            onChange={handleChange}
            maxLength={100}
            placeholder="Qualquer informação adicional relevante..."
            isTextArea={false}
            optionalLabel=""
            disabled={isLoadingData}
          />
        </div>

        <div className="flex flex-wrap justify-end pt-4 border-t mt-6">
  <div className="mb-2 mr-0 md:mr-3">
    <button
      type="button"
      onClick={handleDelete}
      disabled={isSubmitting || isLoadingData || !isEditing || !formData.id}
      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-100 disabled:cursor-not-allowed flex items-center space-x-2"
      aria-label="Excluir"
    >
      <Trash2 size={18} />
      <span>Excluir</span>
    </button>
  </div>
  <div className="mb-2">
    <button
      type="submit"
      disabled={isSubmitting || isLoadingData || isLoadingOptions}
      className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-100 disabled:cursor-not-allowed flex items-center space-x-2"
      aria-label={isEditing ? 'Atualizar' : 'Salvar'}
    >
      {isEditing ? <Edit3 size={18} /> : <PlusCircle size={18} />}
      <span>{isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}</span>
    </button>
  </div>
</div>
      </form>
    </div>
  );
};

export default FornecedoresForm;
