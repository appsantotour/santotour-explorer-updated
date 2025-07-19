
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface MotoristasSectionProps {
  formData: Pick<ViagensFormData, 'qtdemotoristas' | 'qtdealmocosmotoristas' | 'qtdejantasmotoristas' | 'refeicaomotoristaunitario' | 'totalrefeicaomotorista' | 'qtdedeslocamentosmotoristas' | 'deslocamentomotoristaunitario' | 'totaldeslocamentosmotoristas' | 'totaldespesasmotoristas' | 'adiantamentomotoristas' | 'motoristasobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  disabled?: boolean;
}

const MotoristasSection: React.FC<MotoristasSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        MOTORISTAS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
        <InputField id="qtdemotoristas" name="qtdemotoristas" label="Qtde Motoristas" type="text" value={formData.qtdemotoristas ?? ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdealmocosmotoristas" name="qtdealmocosmotoristas" label="Qtde Almoços" type="text" value={formData.qtdealmocosmotoristas ?? ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdejantasmotoristas" name="qtdejantasmotoristas" label="Qtde Jantas" type="text" value={formData.qtdejantasmotoristas ?? ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" inputMode="numeric" disabled={disabled}/>
        <InputField id="refeicaomotoristaunitario" name="refeicaomotoristaunitario" label="Valor Unit." type="text" value={formData.refeicaomotoristaunitario ?? ''} onChange={handleChange} maskType="currency" placeholder="Ex: 25,50" inputMode="decimal" disabled={disabled}/>
        <InputField id="totalrefeicaomotorista" name="totalrefeicaomotorista" label="Total Refeições" type="text" value={formData.totalrefeicaomotorista ?? ''} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="qtdedeslocamentosmotoristas" name="qtdedeslocamentosmotoristas" label="Qtde Deslocamentos" type="text" value={formData.qtdedeslocamentosmotoristas ?? ''} onChange={handleChange} maskType="integer" placeholder="Min. 0" inputMode="numeric" disabled={disabled}/>
        <InputField id="deslocamentomotoristaunitario" name="deslocamentomotoristaunitario" label="Valor Unit." type="text" value={formData.deslocamentomotoristaunitario ?? ''} onChange={handleChange} maskType="currency" placeholder="Ex: 50,00" inputMode="decimal" disabled={disabled}/>
        <InputField id="totaldeslocamentosmotoristas" name="totaldeslocamentosmotoristas" label="Total Deslocamentos" type="text" value={formData.totaldeslocamentosmotoristas ?? ''} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="totaldespesasmotoristas" name="totaldespesasmotoristas" label="Total Desp. Motoristas" type="text" value={formData.totaldespesasmotoristas ?? ''} onChange={handleChange} maskType="currency" readOnly className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentomotoristas" name="adiantamentomotoristas" label="Adiantamento" type="text" value={formData.adiantamentomotoristas ?? ''} onChange={handleChange} maskType="currency" placeholder="Ex: 100,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="motoristasobservacao" name="motoristasobservacao" label="Observações" value={formData.motoristasobservacao ?? ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre os motoristas..." className="md:col-span-2" isTextArea={false} disabled={disabled} />
      </div>
    </div>
  );
};

export default MotoristasSection;
