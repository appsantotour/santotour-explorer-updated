
import React, { useState, useEffect, useCallback } from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';
import SelectField from '../../SelectField';
import { supabase } from '../../../integrations/supabase/client';
import { useToast } from '../../../hooks/use-toast';

interface GuiaOption {
  value: string;
  label: string;
  whatsapp: string;
}

interface TaxasSectionProps {
  formData: Pick<ViagensFormData, 'taxacidade' | 'outrastaxasvalor' | 'estacionamento' | 'taxaguialocal' | 'nomeguia' | 'whatsappguia' | 'nomeguialocal' | 'whatsappguialocal' | 'totaldespesastaxas' | 'adiantamentotaxas' | 'taxasobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const TaxasSection: React.FC<TaxasSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  const [guiasOptions, setGuiasOptions] = useState<GuiaOption[]>([]);
  const [isLoadingGuias, setIsLoadingGuias] = useState(false);
  const { toast } = useToast();

  const fetchGuias = useCallback(async () => {
    
    setIsLoadingGuias(true);
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('id, nome_contato, whatsapp')
        .eq('guias', true)
        .eq('ativo', true)
        .order('nome_contato', { ascending: true });

      if (error) throw error;

      const options = data.map(guia => ({
        value: guia.nome_contato || '', // Using nome_contato instead of nome_fornecedor
        label: guia.nome_contato || '',
        whatsapp: guia.whatsapp || ''
      }));

      setGuiasOptions(options);
    } catch (error: any) {
      console.error('Erro ao buscar guias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de guias.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingGuias(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGuias();
  }, [fetchGuias]);

  const formatPhoneToE164 = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's 11 digits (Brazilian number with 9th digit), add +55
    if (digits.length === 11) {
      return `+55${digits}`;
    }
    
    // If it's 13 digits (already with country code), add +
    if (digits.length === 12) {
      return `+${digits}`;
    }
    
    // Otherwise return as is (will fail DB constraint if not in E.164)
    return `+${digits}`;
  };

  const handleGuiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGuia = guiasOptions.find(guia => guia.value === e.target.value);
    
    if (selectedGuia) {
      // Update the visible fields
      const nomeEvent = {
        target: { name: 'nomeguia', value: selectedGuia.value },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(nomeEvent);
      
      // Format the phone number to E.164 before updating the form
      if (selectedGuia.whatsapp) {
        const formattedPhone = formatPhoneToE164(selectedGuia.whatsapp);
        const whatsappEvent = {
          target: { name: 'whatsappguia', value: formattedPhone },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(whatsappEvent);
      }
      
      // These will be mapped to the DB fields in ViagensForm
      const nomeLocalEvent = {
        target: { name: 'nomeguialocal', value: selectedGuia.value },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(nomeLocalEvent);
      
      if (selectedGuia.whatsapp) {
        const formattedPhone = formatPhoneToE164(selectedGuia.whatsapp);
        const whatsappLocalEvent = {
          target: { name: 'whatsappguialocal', value: formattedPhone },
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(whatsappLocalEvent);
      }
    }
  };
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        TAXAS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="taxacidade" name="taxacidade" label="Taxa Cidade" type="text" value={formData.taxacidade || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 15,50" className="md:col-span-1" inputMode="decimal" disabled={disabled} />
        <InputField id="outrastaxasvalor" name="outrastaxasvalor" label="Outras Taxas" type="text" value={formData.outrastaxasvalor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 10,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="estacionamento" name="estacionamento" label="Estacionamento" type="text" value={formData.estacionamento || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 25,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="taxaguialocal" name="taxaguialocal" label="Taxa Guia Local" type="text" value={formData.taxaguialocal || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <SelectField
  id="nomeguia"
  name="nomeguia"
  label="Nome Guia Local"
  value={formData.nomeguia || ''}
  onChange={handleGuiaChange}
  options={guiasOptions}
  className="md:col-span-1"
  disabled={disabled || isLoadingGuias}
/>
        <InputField id="whatsappguia" name="whatsappguia" label="WhatsApp Guia" type="tel" value={formData.whatsappguia || ''} onChange={handleChange} maskType="phone" maxLength={15} placeholder="(00) 00000-0000" className="md:col-span-1" inputMode="tel" disabled={disabled}/>
        <InputField id="totaldespesastaxas" name="totaldespesastaxas" label="Total Desp. Taxas" type="text" value={formData.totaldespesastaxas || '0,00'} onChange={handleChange} maskType="currency" placeholder="Ex: 100,50" className="md:col-span-1" readOnly inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentotaxas" name="adiantamentotaxas" label="Adiantamento" type="text" value={formData.adiantamentotaxas || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="taxasobservacao" name="taxasobservacao" label="Observações" value={formData.taxasobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre as taxas..." className="md:col-span-4" isTextArea={false} disabled={disabled} />
      </div>
    </div>
  );
};

export default TaxasSection;
