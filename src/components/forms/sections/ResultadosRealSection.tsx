
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';
import { parseBRLCurrency } from '../../../utils/maskUtils'; // Added import

interface ResultadosRealSectionProps {
  formData: Pick<ViagensFormData, 'qtdepagantesreal' | 'qtdepagantesminimo' | 'despesatotalreal' | 'receitatotalreal' | 'lucrobrutoreal' | 'resultadobruto' | 'totaldescontosreal' | 'totalindicacoesreal' | 'lucroliquidoreal' | 'observacoesreal'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  expenseStyle: string;
  revenueStyle: string;
  lucroLiquidoRealStyle: string;
  disabled?: boolean;
}

const ResultadosRealSection: React.FC<ResultadosRealSectionProps> = ({
  formData,
  handleChange,
  expenseStyle,
  revenueStyle,
  lucroLiquidoRealStyle,
  disabled,
}) => {
  const lucroBrutoRealNum = parseBRLCurrency(formData.lucrobrutoreal) ?? 0;
  const lucroBrutoRealInputClassName = lucroBrutoRealNum < 0 ? expenseStyle : revenueStyle;

  const lucroLiquidoRealNum = parseBRLCurrency(formData.lucroliquidoreal) ?? 0;
  const lucroLiquidoRealInputClassNameDynamic = lucroLiquidoRealNum < 0 ? expenseStyle : lucroLiquidoRealStyle;

  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        RESULTADOS (REAL)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
        <InputField id="qtdepagantesreal" name="qtdepagantesreal" label="Qtde Pagantes" type="text" value={String(formData.qtdepagantesreal || '0')} onChange={handleChange} readOnly inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdepagantesminimo" name="qtdepagantesminimo" label="Pagantes Mínimo" type="text" value={String(formData.qtdepagantesminimo || '0')} onChange={handleChange} readOnly inputMode="numeric" disabled={disabled}/>
        <InputField id="despesatotalreal" name="despesatotalreal" label="Despesa Total" type="text" value={formData.despesatotalreal || '0,00'} onChange={handleChange} readOnly inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="receitatotalreal" name="receitatotalreal" label="Receita Total" type="text" value={formData.receitatotalreal || '0,00'} onChange={handleChange} readOnly inputMode="decimal" inputClassName={revenueStyle} disabled={disabled}/>
        <InputField 
          id="lucrobrutoreal" 
          name="lucrobrutoreal" 
          label="Lucro Bruto" 
          type="text" 
          value={formData.lucrobrutoreal || '0,00'} 
          onChange={handleChange} 
          readOnly 
          inputMode="decimal" 
          inputClassName={lucroBrutoRealInputClassName} 
          disabled={disabled}
        />
        <InputField id="totaldescontosreal" name="totaldescontosreal" label="Total Descontos" type="text" value={formData.totaldescontosreal || '0,00'} onChange={handleChange} readOnly inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="totalindicacoesreal" name="totalindicacoesreal" label="Total Indicações" type="text" value={formData.totalindicacoesreal || '0,00'} onChange={handleChange} readOnly inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField 
          id="lucroliquidoreal" 
          name="lucroliquidoreal" 
          label="Lucro Líquido" 
          type="text" 
          value={formData.lucroliquidoreal || '0,00'} 
          onChange={handleChange} 
          readOnly 
          inputMode="decimal" 
          inputClassName={lucroLiquidoRealInputClassNameDynamic} 
          disabled={disabled}
        />
        <InputField id="observacoesreal" name="observacoesreal" label="Observações" value={formData.observacoesreal || ''} onChange={handleChange} isTextArea={false} maxLength={100} placeholder="Observações sobre os resultados reais..." className="md:col-span-4" disabled={disabled}/>
      </div>
    </div>
  );
};

export default ResultadosRealSection;
