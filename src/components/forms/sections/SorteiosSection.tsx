
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface SorteiosSectionProps {
  formData: Pick<ViagensFormData, 'sorteio1qtde' | 'sorteio1valor' | 'sorteio1descricao' | 'sorteio2qtde' | 'sorteio2valor' | 'sorteio2descricao' | 'sorteio3qtde' | 'sorteio3valor' | 'sorteio3descricao' | 'totaldespesassorteios' | 'adiantamentosorteios' | 'sorteiosobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const SorteiosSection: React.FC<SorteiosSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        SORTEIOS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="sorteio1qtde" name="sorteio1qtde" label="Qtde Sorteio 1" type="text" value={formData.sorteio1qtde || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="sorteio1valor" name="sorteio1valor" label="Valor" type="text" value={formData.sorteio1valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 30,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="sorteio1descricao" name="sorteio1descricao" label="Descrição" value={formData.sorteio1descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do sorteio 1" className="md:col-span-4" disabled={disabled}/>
        <InputField id="sorteio2qtde" name="sorteio2qtde" label="Qtde Sorteio 2" type="text" value={formData.sorteio2qtde || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="sorteio2valor" name="sorteio2valor" label="Valor" type="text" value={formData.sorteio2valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 45,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="sorteio2descricao" name="sorteio2descricao" label="Descrição" value={formData.sorteio2descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do sorteio 2" className="md:col-span-4" disabled={disabled}/>
        <InputField id="sorteio3qtde" name="sorteio3qtde" label="Qtde Sorteio 3" type="text" value={formData.sorteio3qtde || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="sorteio3valor" name="sorteio3valor" label="Valor" type="text" value={formData.sorteio3valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 60,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="sorteio3descricao" name="sorteio3descricao" label="Descrição" value={formData.sorteio3descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do sorteio 3" className="md:col-span-4" disabled={disabled}/>
        <InputField id="totaldespesassorteios" name="totaldespesassorteios" label="Total Sorteios" type="text" value={formData.totaldespesassorteios || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentosorteios" name="adiantamentosorteios" label="Adiantamento" type="text" value={formData.adiantamentosorteios || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="sorteiosobservacao" name="sorteiosobservacao" label="Observações" value={formData.sorteiosobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes gerais sobre sorteios..." className="md:col-span-4" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default SorteiosSection;
