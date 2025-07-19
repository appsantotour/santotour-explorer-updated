
import React from 'react';
import { ViagensFormData } from '../../../types';
import InputField from '../../InputField';
import SelectField from '../../SelectField';

interface Option {
  value: string;
  label: string;
}

interface TransporteSectionProps {
  formData: Pick<ViagensFormData, 'cidadetransporte' | 'empresatransporte' | 'contatotransporte' | 'whatsapptransporte' | 'tipoveiculo' | 'qtdeassentos' | 'qtdereservadosguias' | 'qtdepromocionais' | 'naovendidos' | 'qtdenaopagantes' | 'qtdepagantes' | 'frete' | 'adiantamentotransporte' | 'transporteobservacao'>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  cidadeTransporteOptions: Option[];
  isLoadingCidadeTransporte: boolean;
  empresaTransporteOptions: Option[];
  isLoadingEmpresaTransporte: boolean;
  tipoVeiculoOptions: Option[];
  expenseStyle: string;
  disabled?: boolean;
}

const TransporteSection: React.FC<TransporteSectionProps> = ({
  formData,
  handleChange,
  cidadeTransporteOptions,
  isLoadingCidadeTransporte,
  empresaTransporteOptions,
  isLoadingEmpresaTransporte,
  tipoVeiculoOptions,
  expenseStyle,
  disabled,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-6">
        TRANSPORTE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-6">
        <SelectField 
          id="cidadetransporte" 
          name="cidadetransporte" 
          label="Cidade Origem" 
          value={formData.cidadetransporte || ''} 
          onChange={handleChange} 
          options={cidadeTransporteOptions} 
          required 
          className="md:col-span-1" 
          disabled={isLoadingCidadeTransporte || disabled}
        />
        <SelectField 
          id="empresatransporte" 
          name="empresatransporte" 
          label="Empresa" 
          value={formData.empresatransporte || ''} 
          onChange={handleChange} 
          options={empresaTransporteOptions} 
          className="md:col-span-1" 
          disabled={isLoadingEmpresaTransporte || disabled || !formData.cidadetransporte}
        />
        <InputField 
          id="contatotransporte" 
          name="contatotransporte" 
          label="Nome Contato" 
          value={formData.contatotransporte || ''} 
          onChange={handleChange} 
          placeholder="Automático" 
          className="md:col-span-2" 
          readOnly 
          disabled={disabled}
        />
        <InputField 
          id="whatsapptransporte" 
          name="whatsapptransporte" 
          label="WhatsApp" 
          type="tel" 
          value={formData.whatsapptransporte || ''} 
          onChange={handleChange} 
          maskType="phone" 
          maxLength={15} 
          placeholder="Automático" 
          className="md:col-span-1" 
          inputMode="tel" 
          readOnly 
          disabled={disabled}
        />
        <SelectField 
          id="tipoveiculo" 
          name="tipoveiculo" 
          label="Tipo Veículo" 
          value={formData.tipoveiculo || ''} 
          onChange={handleChange} 
          options={tipoVeiculoOptions} 
          className="md:col-span-1" 
          disabled={disabled || !formData.empresatransporte}
        />
        <InputField 
          id="qtdeassentos" 
          name="qtdeassentos" 
          label="Qtde Assentos" 
          type="text" 
          value={formData.qtdeassentos || '0'} 
          onChange={handleChange} 
          maskType="integer" 
          placeholder="Automático" 
          className="md:col-span-1" 
          inputMode="numeric"
          disabled={disabled}
        />
        <InputField id="qtdereservadosguias" name="qtdereservadosguias" label="Reservados Guias" type="text" value={formData.qtdereservadosguias || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 2" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdepromocionais" name="qtdepromocionais" label="Promocionais" type="text" value={formData.qtdepromocionais || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 5" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="naovendidos" name="naovendidos" label="Não Vendidas" type="text" value={formData.naovendidos || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 3" className="md:col-span-1" inputMode="numeric" disabled={disabled}/>
        <InputField id="qtdenaopagantes" name="qtdenaopagantes" label="Total Não Pagantes" type="text" value={formData.qtdenaopagantes || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 1" className="md:col-span-1" inputMode="numeric" readOnly disabled={disabled}/>
        <InputField id="qtdepagantes" name="qtdepagantes" label="Total Pagantes" type="text" value={formData.qtdepagantes || ''} onChange={handleChange} maskType="integer" placeholder="Ex: 30" className="md:col-span-1" inputMode="numeric" readOnly disabled={disabled}/>
        <InputField id="frete" name="frete" label="Valor Frete" value={formData.frete || ''} onChange={handleChange} type="text" maskType="currency" placeholder="Ex: 1.200,00" className="md:col-span-1" inputMode="decimal" inputClassName={expenseStyle} disabled={disabled}/>
        <InputField id="adiantamentotransporte" name="adiantamentotransporte" label="Adiantamento" type="text" value={formData.adiantamentotransporte || ''} onChange={handleChange} maskType="currency" placeholder="Ex: 600,00" className="md:col-span-1" inputMode="decimal" disabled={disabled}/>
        <InputField id="transporteobservacao" name="transporteobservacao" label="Observações" value={formData.transporteobservacao || ''} onChange={handleChange} maxLength={100} placeholder="Detalhes sobre o transporte..." className="md:col-span-4" isTextArea={false} disabled={disabled} />
      </div>
    </div>
  );
};

export default TransporteSection;
