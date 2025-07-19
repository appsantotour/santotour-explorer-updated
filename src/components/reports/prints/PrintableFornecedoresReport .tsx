
import React from 'react';
import { FornecedoresFormData } from '../../../types'; // Adjust path as necessary
import { applyPhoneMask } from '../../../utils/maskUtils';

// Interface for data specifically shaped for this report's display
interface ReportFornecedorDataPrint extends FornecedoresFormData {
  servicos_oferecidos_display: string; 
}

export interface PrintFornecedorColumn {
  key: keyof ReportFornecedorDataPrint; // Ensure this uses keys from the print-specific data interface
  label: string;
}

interface PrintableFornecedoresReportProps {
  columns: PrintFornecedorColumn[];
  fornecedores: ReportFornecedorDataPrint[];
}

const PrintableFornecedoresReport: React.FC<PrintableFornecedoresReportProps> = ({ columns, fornecedores }) => {
  
  const formatCellContent = (fornecedor: ReportFornecedorDataPrint, columnKey: keyof ReportFornecedorDataPrint): string => {
    let value = fornecedor[columnKey];

    if (value === null || value === undefined) return '';

    switch (columnKey) {
      case 'whatsapp':
      case 'telefone':
        return applyPhoneMask(String(value));
      case 'servicos_oferecidos_display': // Use the pre-formatted display string
        return String(value);
      case 'ativo':
        return value ? 'Sim' : 'Não';
      // Handle boolean fields for services if they were directly in columns (they are not by default based on config)
      case 'fretamento': case 'onibus': case 'semi_leito': case 'microonibus': 
      case 'van': case 'carro': case 'hospedagem': case 'guias': 
      case 'passeios': case 'ingressos': case 'estacionamentos': case 'brindes':
        return value ? 'Sim' : 'Não';
      default:
        return String(value);
    }
  };
  
  return (
    <div className="print-container">
      <h1 className="print-title">Relatório de Fornecedores</h1>
      <table className="print-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor, fornecedorIndex) => (
            <tr key={fornecedor.id || `fornecedor-${fornecedorIndex}`}>
              {columns.map(col => (
                <td key={`${fornecedor.id}-${String(col.key)}`}>
                  {formatCellContent(fornecedor, col.key)}
                </td>
              ))}
            </tr>
          ))}
          {fornecedores.length === 0 && (
             <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                    Nenhum fornecedor para exibir.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableFornecedoresReport;
