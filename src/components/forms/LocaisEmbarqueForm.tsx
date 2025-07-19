
import React, { useState, useCallback, useEffect } from 'react';
import InputField from '../InputField';
// SelectField import removed as selection is handled by parent
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { sanitizeFormData } from '../../utils/sanitizationUtils';
import { Trash2, Edit3, PlusCircle } from 'lucide-react';

interface LocaisEmbarqueFormData {
  id?: string;
  localembarque: string;
  enderecoembarque: string;
  cidade: string;
  ativo?: boolean; // true = ativo, false = inativo
}

type LocaisEmbarqueFormFieldName = keyof LocaisEmbarqueFormData;

const initialFormData: LocaisEmbarqueFormData = {
  id: undefined,
  localembarque: '',
  enderecoembarque: '',
  cidade: '',
  ativo: true,
};

interface LocaisEmbarqueFormProps {
  mode: 'new' | 'edit';
  localIdToLoad?: string | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

const LocaisEmbarqueForm: React.FC<LocaisEmbarqueFormProps> = ({
  mode,
  localIdToLoad,
  onSaveSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LocaisEmbarqueFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  // isEditing is true if mode is 'edit' and data is loaded (formData.id is set)
  const isEditing = mode === 'edit' && !!formData.id;
  const { toast } = useToast();

  useEffect(() => {
    const loadLocalData = async () => {
      if (mode === 'edit' && localIdToLoad) {
        setIsLoadingData(true);
        const { data, error } = await supabase
          .from('locais_embarque')
          .select('*')
          .eq('id', localIdToLoad)
          .single();

        if (error) {
          toast({ title: "Erro ao Carregar Local", description: error.message, variant: "destructive" });
          setFormData(initialFormData); // Reset form
          onCancel(); // Signal parent to perhaps go back to selection
        } else if (data) {
          setFormData({
            id: data.id,
            localembarque: data.localembarque || '',
            enderecoembarque: data.enderecoembarque || '',
            cidade: data.cidade || '',
            ativo: typeof data.ativo === 'boolean' ? data.ativo : true,
          });
          // isEditing state will be derived from mode and formData.id
        } else {
          toast({ title: "Local não encontrado", description: "O local selecionado não foi encontrado.", variant: "warning" });
          setFormData(initialFormData);
          onCancel();
        }
        setIsLoadingData(false);
      } else if (mode === 'new') {
        setFormData(initialFormData); // Ensure form is reset for new mode
      }
    };

    loadLocalData();
  }, [mode, localIdToLoad, toast, onCancel]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name as LocaisEmbarqueFormFieldName]: type === 'checkbox' ? checked : value,
    }));
  }, []);


  const validateForm = (): boolean => {
    const { localembarque, enderecoembarque, cidade } = formData;
    if (!localembarque.trim() || localembarque.length < 3) {
      toast({ title: "Validação Falhou", description: "Local de Embarque é obrigatório (mín. 3 caracteres).", variant: "warning" });
      return false;
    }
    if (!enderecoembarque.trim() || enderecoembarque.length < 5) {
      toast({ title: "Validação Falhou", description: "Endereço de Embarque é obrigatório (mín. 5 caracteres).", variant: "warning" });
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
    if (!validateForm()) return;

    // Remove Supabase configuration check since it's always configured
    setIsSubmitting(true);
    const dataToSave = sanitizeFormData({
      localembarque: formData.localembarque,
      enderecoembarque: formData.enderecoembarque,
      cidade: formData.cidade,
      ativo: formData.ativo ?? true,
    }, ['ativo']);

    let error = null;
    let successMessage = "";

    if (isEditing && formData.id) {
      const { error: updateError } = await supabase.from('locais_embarque').update(dataToSave).eq('id', formData.id);
      error = updateError;
      successMessage = 'Local de embarque atualizado com sucesso!';
    } else { // mode === 'new'
      const { data: insertedData, error: insertError } = await supabase.from('locais_embarque').insert([dataToSave]).select().single();
      error = insertError;
      if (!error && insertedData) {
        successMessage = 'Local de embarque salvo com sucesso!';
        onSaveSuccess(); // Call success callback
      } else if (!error) {
        successMessage = 'Local salvo, mas ID não retornado.';
      }
    }

    if (error) {
      toast({ title: `Erro ao ${isEditing ? 'Atualizar' : 'Salvar'}`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: successMessage });
      if (isEditing) { // If editing existing, call onSaveSuccess
        onSaveSuccess();
      }
      // For new, onSaveSuccess is called above upon successful insertion
    }
    setIsSubmitting(false);
  }, [formData, isEditing, toast, onSaveSuccess]);

  const handleDelete = useCallback(async () => {
    if (!isEditing || !formData.id) {
      toast({ title: "Ação Inválida", description: "Nenhum local selecionado para excluir.", variant: "warning" });
      return;
    }
    // Remove Supabase configuration check since it's always configured

    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o local "${formData.localembarque}"? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('locais_embarque').delete().eq('id', formData.id);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Local Excluído", description: `O local "${formData.localembarque}" foi excluído.` });
      onSaveSuccess(); // Signal success to parent, which will change view mode
    }
  }, [isEditing, formData, toast, onSaveSuccess]);

  if (isLoadingData) {
    return <div className="text-center p-10">Carregando dados do local...</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-gray-300 rounded-lg p-4 md:p-6">
          <div className="mb-4 flex items-center">
            <label htmlFor="ativo" className="mr-3 font-medium text-gray-700">Status do local:</label>
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={!!formData.ativo}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className={formData.ativo ? 'ml-2 text-green-700 font-semibold' : 'ml-2 text-red-700 font-semibold'}>
              {formData.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
            {mode === 'edit' ? 'EDITAR LOCAL DE EMBARQUE' : 'NOVO LOCAL DE EMBARQUE'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-6">
            <InputField
              id="localembarque"
              name="localembarque"
              label="Nome do Local de Embarque"
              value={formData.localembarque}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Ex: Rodoviária Central"
              className="md:col-span-2"
              disabled={isLoadingData || isSubmitting}
            />
            <InputField
              id="enderecoembarque"
              name="enderecoembarque"
              label="Endereço Completo"
              value={formData.enderecoembarque}
              onChange={handleChange}
              required
              maxLength={150}
              placeholder="Ex: Av. Principal, 123, Centro"
              className="md:col-span-2"
              disabled={isLoadingData || isSubmitting}
            />
            <InputField
              id="cidade"
              name="cidade"
              label="Cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
              maxLength={50}
              placeholder="Ex: São Paulo"
              className="md:col-span-1"
              disabled={isLoadingData || isSubmitting}
            />
            <div className="flex items-center md:col-span-2">
              <label htmlFor="ativo" className="mr-3 font-medium text-gray-700">Status do Local:</label>
              <input
                id="ativo"
                name="ativo"
                type="checkbox"
                checked={!!formData.ativo}
                onChange={e => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                className="form-checkbox h-5 w-5 text-green-600"
                disabled={isLoadingData || isSubmitting}
              />
              <span className={"ml-2 font-semibold " + (formData.ativo ? "text-green-700" : "text-red-600")}>{formData.ativo ? "Ativo" : "Inativo"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end pt-4 border-t mt-6">
  {isEditing && (
    <div className="mb-2 mr-0 md:mr-3">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isSubmitting || isLoadingData || !formData.id}
        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        aria-label="Excluir local"
      >
        <Trash2 size={18} />
        <span>Excluir</span>
      </button>
    </div>
  )}
  <div className="mb-2">
    <button
      type="submit"
      disabled={isSubmitting || isLoadingData}
      className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      aria-label={isEditing ? 'Atualizar local' : 'Salvar novo local'}
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

export default LocaisEmbarqueForm;
