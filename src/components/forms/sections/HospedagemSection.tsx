
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';
import SelectField from '../../SelectField';

interface Option {
  value: string;
  label: string;
}

// const emptyOption: Option[] = [{value: '', label: 'Selecione uma opção'}]; // Can be removed if not used elsewhere
const regimesHospedagemStaticOptions: Option[] = [
    { value: '', label: 'Selecione um regime' },
    { value: 'Pernoite', label: 'Pernoite' },
    { value: 'Café da manhã', label: 'Café da manhã' },
    { value: 'Meia pensão', label: 'Meia pensão' },
    { value: 'Pensão completa', label: 'Pensão completa' },
];

interface HospedagemSectionProps {
  formData: Pick<ViagensFormData, 'cidadehospedagem' | 'empresahospedagem' | 'tipohospedagem' | 'regimehospedagem' | 'contatohospedagem' | 'whatsapphospedagem' | 'qtdehospedes' | 'qtdediarias' | 'valordiariaunitario' | 'totaldiarias' | 'outrosservicosvalor' | 'outrosservicosdescricao' | 'totaldespesashospedagem' | 'adiantamentohospedagem' | 'hospedagemobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  cidadeHospedagemOptions: Option[];
  isLoadingCidadeHospedagem: boolean;
  empresaHospedagemOptions: Option[];
  isLoadingEmpresaHospedagem: boolean;
  expenseStyle: string;
  disabled?: boolean;
}

const HospedagemSection: React.FC<HospedagemSectionProps> = ({
  formData,
  handleChange,
  cidadeHospedagemOptions,
  isLoadingCidadeHospedagem,
  empresaHospedagemOptions,
  isLoadingEmpresaHospedagem,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        HOSPEDAGEM
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
        <SelectField 
          id="cidadehospedagem" 
          name="cidadehospedagem" 
          label="Cidade Hospedagem" 
          value={formData.cidadehospedagem || ''} 
          onChange={handleChange} 
          options={cidadeHospedagemOptions} 
          disabled={isLoadingCidadeHospedagem || disabled}
        />
        <SelectField 
            id="empresahospedagem" 
            name="empresahospedagem" 
            label="Nome Hospedagem" 
            value={formData.empresahospedagem || ''} 
            onChange={handleChange} 
            options={empresaHospedagemOptions} 
            disabled={disabled || isLoadingEmpresaHospedagem || !formData.cidadehospedagem}
        />
        <InputField 
            id="tipohospedagem" 
            name="tipohospedagem" 
            label="Tipo Hospedagem" 
            value={formData.tipohospedagem || ''} 
            onChange={handleChange} 
            placeholder="Automático" 
            readOnly 
            disabled={disabled}
        />
        <SelectField 
            id="regimehospedagem" 
            name="regimehospedagem" 
            label="Regime" 
            value={formData.regimehospedagem || ''} 
            onChange={handleChange} 
            options={regimesHospedagemStaticOptions} 
            disabled={disabled}
        />
        <InputField 
            id="contatohospedagem" 
            name="contatohospedagem" 
            label="Nome do Contato" 
            value={formData.contatohospedagem || ''} 
            onChange={handleChange} 
            maxLength={50} 
            placeholder="Automático" 
            readOnly 
            disabled={disabled}
        />
        <InputField 
            id="whatsapphospedagem" 
            name="whatsapphospedagem" 
            label="WhatsApp" 
            type="tel" 
            value={formData.whatsapphospedagem || ''} 
            onChange={handleChange} 
            maskType="phone" 
            placeholder="Automático" 
            inputMode="tel" 
            readOnly 
            disabled={disabled}
        />
        <InputField id="qtdehospedes" name="qtdehospedes" label="Qtde Hóspedes" type="text" value={formData.qtdehospedes || '0'} onChange={handleChange} maskType="integer" readOnly inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdediarias" name="qtdediarias" label="Qtde Diárias" type="text" value={formData.qtdediarias || '0'} onChange={handleChange} maskType="integer" readOnly inputMode="numeric" disabled={disabled}/>
        <InputField id="valordiariaunitario" name="valordiariaunitario" label="Valor Diária" type="text" value={formData.valordiariaunitario || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 150,75" inputMode="decimal" disabled={disabled}/>
        <InputField id="totaldiarias" name="totaldiarias" label="Total Diárias" type="text" value={formData.totaldiarias || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="outrosservicosvalor" name="outrosservicosvalor" label="Outros Serviços R$" type="text" value={formData.outrosservicosvalor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" inputMode="decimal" disabled={disabled}/>
        <InputField id="outrosservicosdescricao" name="outrosservicosdescricao" label="Descrição Outros Serviços" value={formData.outrosservicosdescricao || ''} onChange={handleChange} maxLength={100} placeholder="Ex: Lavanderia" disabled={disabled}/>
        <InputField id="totaldespesashospedagem" name="totaldespesashospedagem" label="Total Hospedagem" type="text" value={formData.totaldespesashospedagem || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentohospedagem" name="adiantamentohospedagem" label="Adiantamento" type="text" value={formData.adiantamentohospedagem || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 500,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="hospedagemobservacao" name="hospedagemobservacao" label="Observações" value={formData.hospedagemobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre a hospedagem..." className="md:col-span-2" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default HospedagemSection;
