
import React from 'react';
import { PassageiroFormData, PassageiroFormFieldName } from '../../../types';
import InputField from '../../InputField';

interface PassageiroPaymentSectionProps {
  formData: PassageiroFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  maxInstallments?: number;
}

const PassageiroPaymentSection: React.FC<PassageiroPaymentSectionProps> = ({
  formData,
  handleChange,
  maxInstallments = 10,
}) => {
  const shouldShowNext = (installmentNumber: number): boolean => {
    if (installmentNumber === 2) {
      // Check valorsinal by parsing it as it's stored as a formatted string
      const sinalValue = parseFloat(String(formData.valorsinal).replace(/\./g, '').replace(',', '.')) || 0;
      return sinalValue > 0;
    }
    const prevInstallmentValueKey = `valorparcela${installmentNumber - 1}` as keyof PassageiroFormData;
    const prevInstallmentValue = parseFloat(String(formData[prevInstallmentValueKey]).replace(/\./g, '').replace(',', '.')) || 0;
    return prevInstallmentValue > 0;
  };

  const renderInstallmentFields = () => {
    const fields = [];
    for (let i = 2; i <= maxInstallments; i++) {
      if (i === 2 || shouldShowNext(i)) {
        const valorKey = `valorparcela${i}` as PassageiroFormFieldName;
        const dataKey = `dataparcela${i}` as PassageiroFormFieldName;
        const obsKey = `observacoesparcela${i}` as PassageiroFormFieldName;
        fields.push(
          <div key={`installment-${i}`} className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4 mb-4 items-end">
            <InputField
              id={valorKey}
              name={valorKey}
              label={`Parcela ${i} R$`}
              type="text" // Keep as text for currency mask
              maskType="currency"
              value={String(formData[valorKey] ?? '')}
              onChange={handleChange}
              placeholder="0,00"
              className="md:col-span-1"
            />
            <InputField
              id={dataKey}
              name={dataKey}
              label={`Data Parc. ${i}`}
              type="text"
              maskType="date"
              placeholder="DD/MM/AAAA"
              value={String(formData[dataKey] ?? '')}
              onChange={handleChange}
              className="md:col-span-1"
            />
            <InputField
              id={obsKey}
              name={obsKey}
              label={`Obs. Parc. ${i}`}
              value={String(formData[obsKey] ?? '')}
              onChange={handleChange}
              placeholder="Detalhes da parcela"
              maxLength={100} // Added maxLength
              className="md:col-span-4"
            />
          </div>
        );
      } else {
        break;
      }
    }
    return fields;
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6 mt-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
        DETALHES DAS PARCELAS
      </h3>
      {renderInstallmentFields()}
    </div>
  );
};

export default PassageiroPaymentSection;
