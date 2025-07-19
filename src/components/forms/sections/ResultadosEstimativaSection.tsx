

import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface ResultadosEstimativaSectionProps {
  formData: Pick<ViagensFormData, 'qtdepagantesresultados' | 'despesatotal' | 'pontoequilibrio' | 'margemdesejada' | 'precosugerido' | 'precodefinido' | 'receitatotal' | 'lucrobruto' | 'comissaodivulgacao' | 'comissaodivulgacaovalor' | 'comissaomaxdivulgacao' | 'lucroliquido'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  lucroLiquidoStyle: string;
  disabled?: boolean;
}

const ResultadosEstimativaSection: React.FC<ResultadosEstimativaSectionProps> = ({
  formData,
  handleChange,
  lucroLiquidoStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        RESULTADOS (ESTIMATIVA)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
        <InputField id="qtdepagantesresultados" name="qtdepagantesresultados" label="Qtde Pagantes" type="text" value={String(formData.qtdepagantesresultados || '0')} onChange={handleChange} maskType="integer" readOnly inputMode="numeric" disabled={disabled}/>
        <InputField id="despesatotal" name="despesatotal" label="Despesa Total" type="text" value={formData.despesatotal || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="pontoequilibrio" name="pontoequilibrio" label="Ponto Equilíbrio" type="text" value={formData.pontoequilibrio || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField
            id="margemdesejada"
            name="margemdesejada"
            label="Margem Lucro Desejada (%)"
            type="text"
            value={formData.margemdesejada || ''}
            onChange={handleChange}
            maskType="integer"
            placeholder="Ex: 30"
            inputMode="numeric"
            disabled={disabled}
        />
        <InputField 
            id="precosugerido" 
            name="precosugerido" 
            label="Preço Sugerido" 
            type="text" 
            value={formData.precosugerido || '0,00'} 
            onChange={handleChange} 
            maskType="currency" 
            readOnly 
            inputMode="decimal" 
            disabled={disabled}
        />
        <InputField id="precodefinido" name="precodefinido" label="Preço Definido" type="text" value={formData.precodefinido || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 350,00" inputMode="decimal" disabled={disabled}/>
        <InputField id="receitatotal" name="receitatotal" label="Receita Total" type="text" value={formData.receitatotal || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="lucrobruto" name="lucrobruto" label="Lucro Bruto" type="text" value={formData.lucrobruto || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="comissaodivulgacao" name="comissaodivulgacao" label="Comissão Divulgação %" type="text" value={formData.comissaodivulgacao || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 10" inputMode="numeric" disabled={disabled}/>
        <InputField id="comissaodivulgacaovalor" name="comissaodivulgacaovalor" label="Comissão Divulgação R$" type="text" value={formData.comissaodivulgacaovalor || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="comissaomaxdivulgacao" name="comissaomaxdivulgacao" label="Comissão Máxima R$" type="text" value={formData.comissaomaxdivulgacao || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" disabled={disabled}/>
        <InputField id="lucroliquido" name="lucroliquido" label="Lucro Líquido" type="text" value={formData.lucroliquido || '0,00'} onChange={handleChange} maskType="currency" readOnly inputMode="decimal" inputClassName={lucroLiquidoStyle} disabled={disabled}/>
      </div>
    </div>
  );
};

export default ResultadosEstimativaSection;