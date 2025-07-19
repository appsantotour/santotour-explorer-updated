
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface PasseiosIngressosSectionProps {
  formData: Pick<ViagensFormData, 'qtdepasseios1' | 'valorpasseios1' | 'descricaopasseios1' | 'qtdepasseios2' | 'valorpasseios2' | 'descricaopasseios2' | 'qtdepasseios3' | 'valorpasseios3' | 'descricaopasseios3' | 'totaldespesaspasseios' | 'adiantamentopasseios' | 'passeiosobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const PasseiosIngressosSection: React.FC<PasseiosIngressosSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        PASSEIOS E INGRESSOS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="qtdepasseios1" name="qtdepasseios1" label="Qtde Passeio 1" type="text" value={formData.qtdepasseios1 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="valorpasseios1" name="valorpasseios1" label="Valor" type="text" value={formData.valorpasseios1 || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 120,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="descricaopasseios1" name="descricaopasseios1" label="Descrição" value={formData.descricaopasseios1 || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item 1" className="md:col-span-4" disabled={disabled}/>
        <InputField id="qtdepasseios2" name="qtdepasseios2" label="Qtde Passeio 2" type="text" value={formData.qtdepasseios2 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="valorpasseios2" name="valorpasseios2" label="Valor" type="text" value={formData.valorpasseios2 || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 85,50" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="descricaopasseios2" name="descricaopasseios2" label="Descrição" value={formData.descricaopasseios2 || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item 2" className="md:col-span-4" disabled={disabled}/>
        <InputField id="qtdepasseios3" name="qtdepasseios3" label="Qtde Passeio 3" type="text" value={formData.qtdepasseios3 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="valorpasseios3" name="valorpasseios3" label="Valor" type="text" value={formData.valorpasseios3 || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 200,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="descricaopasseios3" name="descricaopasseios3" label="Descrição" value={formData.descricaopasseios3 || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item 3" className="md:col-span-4" disabled={disabled}/>
        <InputField id="totaldespesaspasseios" name="totaldespesaspasseios" label="Total" type="text" value={formData.totaldespesaspasseios || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentopasseios" name="adiantamentopasseios" label="Adiantamento" type="text" value={formData.adiantamentopasseios || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 100,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="passeiosobservacao" name="passeiosobservacao" label="Observações" value={formData.passeiosobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes gerais..." className="md:col-span-4" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default PasseiosIngressosSection;
