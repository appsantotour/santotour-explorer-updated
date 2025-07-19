
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface BrindesExtrasSectionProps {
  formData: Pick<ViagensFormData, 'qtdebrindes' | 'brindesunitario' | 'brindestotal' | 'brindesdescricao' | 'extras1valor' | 'extras1descricao' | 'extras2valor' | 'extras2descricao' | 'extras3valor' | 'extras3descricao' | 'totaldespesasbrindeesextras' | 'adiantamentobrindes' | 'brindeseextrasobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const BrindesExtrasSection: React.FC<BrindesExtrasSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        BRINDES E EXTRAS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="qtdebrindes" name="qtdebrindes" label="Qtde Brindes" type="text" value={formData.qtdebrindes || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="brindesunitario" name="brindesunitario" label="Valor Unit." type="text" value={formData.brindesunitario || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 10,50" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="brindestotal" name="brindestotal" label="Total" type="text" value={formData.brindestotal || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="brindesdescricao" name="brindesdescricao" label="Descrição" value={formData.brindesdescricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre os brindes..." className="md:col-span-3" disabled={disabled}/>
        <InputField id="extras1valor" name="extras1valor" label="Valor Extra 1" type="text" value={formData.extras1valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 25,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="extras1descricao" name="extras1descricao" label="Descrição" value={formData.extras1descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item extra 1..." className="md:col-span-5" disabled={disabled}/>
        <InputField id="extras2valor" name="extras2valor" label="Valor Extra 2" type="text" value={formData.extras2valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 30,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="extras2descricao" name="extras2descricao" label="Descrição" value={formData.extras2descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item extra 2..." className="md:col-span-5" disabled={disabled}/>
        <InputField id="extras3valor" name="extras3valor" label="Valor Extra 3" type="text" value={formData.extras3valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 15,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="extras3descricao" name="extras3descricao" label="Descrição" value={formData.extras3descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do item extra 3..." className="md:col-span-5" disabled={disabled}/>
        <InputField id="totaldespesasbrindeesextras" name="totaldespesasbrindeesextras" label="Total" type="text" value={formData.totaldespesasbrindeesextras || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentobrindes" name="adiantamentobrindes" label="Adiantamento" type="text" value={formData.adiantamentobrindes || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 20,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="brindeseextrasobservacao" name="brindeseextrasobservacao" label="Observações" value={formData.brindeseextrasobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes gerais sobre brindes e extras..." className="md:col-span-4" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default BrindesExtrasSection;