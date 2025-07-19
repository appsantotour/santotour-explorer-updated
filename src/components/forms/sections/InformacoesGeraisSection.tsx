
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';

interface InformacoesGeraisSectionProps {
  formData: Pick<ViagensFormData, 'destino' | 'cidadesvisitar' | 'datapartida' | 'dataretorno'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  dataPartidaError: string | null;
  dataRetornoError: string | null;
  disabled?: boolean; // General disable for non-date fields
  dateFieldsDisabled?: boolean; // Specific disable for date fields
}

const InformacoesGeraisSection: React.FC<InformacoesGeraisSectionProps> = ({
  formData,
  handleChange,
  dataPartidaError,
  dataRetornoError,
  disabled,
  dateFieldsDisabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        INFORMAÇÕES GERAIS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
        <InputField 
          id="destino" 
          name="destino" 
          label="Destino" 
          value={formData.destino} 
          onChange={handleChange} 
          required 
          placeholder="Ex: Paris, França" 
          disabled={disabled} // General disabled applies here
        />
        <InputField 
          id="cidadesvisitar" 
          name="cidadesvisitar" 
          label="Cidades a Visitar" 
          value={formData.cidadesvisitar || ''} 
          onChange={handleChange} 
          placeholder="Ex: Roma, Florença, Veneza" 
          disabled={disabled} // General disabled applies here
        />
        <InputField 
          id="datapartida" 
          name="datapartida" 
          label="Data de Partida" 
          value={formData.datapartida} 
          onChange={handleChange} 
          type="text" 
          maskType="date" 
          placeholder="DD/MM/AAAA" 
          required 
          error={dataPartidaError}
          disabled={dateFieldsDisabled || disabled} // Specific and general disable
        />
        <InputField 
          id="dataretorno" 
          name="dataretorno" 
          label="Data de Retorno" 
          value={formData.dataretorno} 
          onChange={handleChange} 
          type="text" 
          maskType="date" 
          placeholder="DD/MM/AAAA" 
          required 
          error={dataRetornoError}
          disabled={dateFieldsDisabled || disabled} // Specific and general disable
        />
      </div>
    </div>
  );
};

export default InformacoesGeraisSection;
