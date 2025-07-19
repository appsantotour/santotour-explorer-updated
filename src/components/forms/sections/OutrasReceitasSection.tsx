import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface OutrasReceitasSectionProps {
  formData: Pick<ViagensFormData, 'outrasreceitasvalor' | 'outrasreceitasdescricao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  revenueStyle: string;
  disabled?: boolean;
}

const OutrasReceitasSection: React.FC<OutrasReceitasSectionProps> = ({
  formData,
  handleChange,
  revenueStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        OUTRAS RECEITAS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="outrasreceitasvalor" name="outrasreceitasvalor" label="Outras Receitas" type="text" value={formData.outrasreceitasvalor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 200,00" className="md:col-span-1" inputMode="decimal" inputClassName={revenueStyle} disabled={disabled}/>
        <InputField id="outrasreceitasdescricao" name="outrasreceitasdescricao" label="Observações" value={formData.outrasreceitasdescricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes da receita..." className="md:col-span-4" disabled={disabled}/>
      </div>
    </div>
  );
};

export default OutrasReceitasSection;
