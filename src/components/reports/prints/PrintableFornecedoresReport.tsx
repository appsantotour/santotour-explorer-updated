import React from 'react';
import { applyPhoneMask } from '../../../utils/maskUtils';
import { FornecedoresFormData } from '../../../types';

interface ReportFornecedorData extends FornecedoresFormData {
  servicos_oferecidos_display: string;
}

export interface PrintFornecedorColumn {
  key: keyof ReportFornecedorData;
  label: string;
}

interface PrintableFornecedoresReportProps {
  columns: PrintFornecedorColumn[];
  fornecedores: ReportFornecedorData[];
}

const PrintableFornecedoresReport: React.FC<PrintableFornecedoresReportProps> = ({ columns, fornecedores }) => {
  const formatCellContent = (fornecedor: ReportFornecedorData, columnKey: keyof ReportFornecedorData): string => {
    let value = fornecedor[columnKey];

    if (value === null || value === undefined) return '';

    switch (columnKey) {
      case 'whatsapp':
        return applyPhoneMask(String(value));
      case 'servicos_oferecidos_display':
        return fornecedor.servicos_oferecidos_display;
      case 'ativo':
        return value ? 'Sim' : 'Não';
      default:
        return String(value);
    }
  };

  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Relatório de Fornecedores</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            {columns.map((col) => (
              <th key={col.key} className="py-2 text-left font-semibold">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor, idx) => (
            <tr key={fornecedor.id || idx} className="border-b border-gray-200">
              {columns.map((col) => (
                <td key={col.key} className="py-2">{formatCellContent(fornecedor, col.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableFornecedoresReport;