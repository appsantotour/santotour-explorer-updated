
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface TrasladosSectionProps {
  formData: Pick<ViagensFormData, 'qtdetraslado1' | 'traslado1valor' | 'traslado1descricao' | 'qtdetraslado2' | 'traslado2valor' | 'traslado2descricao' | 'qtdetraslado3' | 'traslado3valor' | 'traslado3descricao' | 'totaldespesastraslados' | 'adiantamentotraslados' | 'trasladosobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const TrasladosSection: React.FC<TrasladosSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        TRASLADOS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <InputField id="qtdetraslado1" name="qtdetraslado1" label="Qtde Traslado 1" type="text" value={formData.qtdetraslado1 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="traslado1valor" name="traslado1valor" label="Valor" type="text" value={formData.traslado1valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="traslado1descricao" name="traslado1descricao" label="Descrição" value={formData.traslado1descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do traslado 1" className="md:col-span-4" disabled={disabled}/>
        <InputField id="qtdetraslado2" name="qtdetraslado2" label="Qtde Traslado 2" type="text" value={formData.qtdetraslado2 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="traslado2valor" name="traslado2valor" label="Valor" type="text" value={formData.traslado2valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 75,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="traslado2descricao" name="traslado2descricao" label="Descrição" value={formData.traslado2descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do traslado 2" className="md:col-span-4" disabled={disabled}/>
        <InputField id="qtdetraslado3" name="qtdetraslado3" label="Qtde Traslado 3" type="text" value={formData.qtdetraslado3 || ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="traslado3valor" name="traslado3valor" label="Valor" type="text" value={formData.traslado3valor || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 100,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="traslado3descricao" name="traslado3descricao" label="Descrição" value={formData.traslado3descricao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes do traslado 3" className="md:col-span-4" disabled={disabled}/>
        <InputField id="totaldespesastraslados" name="totaldespesastraslados" label="Total Traslados" type="text" value={formData.totaldespesastraslados || '0,00'} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentotraslados" name="adiantamentotraslados" label="Adiantamento" type="text" value={formData.adiantamentotraslados || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 150,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="trasladosobservacao" name="trasladosobservacao" label="Observações" value={formData.trasladosobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes gerais sobre os traslados..." className="md:col-span-4" isTextArea={false} disabled={disabled}/>
      </div>
    </div>
  );
};

export default TrasladosSection;
