
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface OutrasDespesasSectionProps {
  formData: Pick<ViagensFormData, 'despesasdiversas' | 'adiantamentodespesasdiversas' | 'despesasdiversasobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const OutrasDespesasSection: React.FC<OutrasDespesasSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        OUTRAS DESPESAS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="despesasdiversas" name="despesasdiversas" label="Desp. Diversas R$" type="text" value={formData.despesasdiversas || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 100,00" className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentodespesasdiversas" name="adiantamentodespesasdiversas" label="Adiantamento" type="text" value={formData.adiantamentodespesasdiversas || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 0,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="despesasdiversasobservacao" name="despesasdiversasobservacao" label="Observações" value={formData.despesasdiversasobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre outras despesas..." className="md:col-span-4" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default OutrasDespesasSection;
