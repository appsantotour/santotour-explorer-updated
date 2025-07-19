
import React from 'react';
import { applyCpfMask, applyPhoneMask, formatNumberToBRLCurrency } from '../../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY } from '../../../utils/dateUtils';

// Corresponds to ReportPassageiroData in PassageirosReport.tsx
interface ReportPassageiroDataPrint {
  id: string;
  idviagem: string;
  nomeviagem: string;
  poltrona?: string | number | null; 
  datapartida_viagem_raw: string; // YYYY-MM-DD
  nomepassageiro: string;
  cpfpassageiro: string;
  telefonepassageiro?: string;
  bairropassageiro?: string;
  cidadepassageiro?: string;
  localembarquepassageiro?: string;
  enderecoembarquepassageiro?: string;
  cpfindicador?: string;
  nome_do_seu_indicador?: string;
  elegiveldesconto: boolean;
  passageiroobservacao?: string;
  valorviagem: number | null;
  valorsinal?: number | null;
  datasinal?: string; // YYYY-MM-DD
  valorparcela2?: number | null; dataparcela2?: string; observacoesparcela2?: string;
  valorparcela3?: number | null; dataparcela3?: string; observacoesparcela3?: string;
  valorparcela4?: number | null; dataparcela4?: string; observacoesparcela4?: string;
  valorparcela5?: number | null; dataparcela5?: string; observacoesparcela5?: string;
  valorparcela6?: number | null; dataparcela6?: string; observacoesparcela6?: string;
  valorparcela7?: number | null; dataparcela7?: string; observacoesparcela7?: string;
  valorparcela8?: number | null; dataparcela8?: string; observacoesparcela8?: string;
  valorparcela9?: number | null; dataparcela9?: string; observacoesparcela9?: string;
  valorparcela10?: number | null; dataparcela10?: string; observacoesparcela10?: string;
  descontopromocional?: number | null;
  descontoindicacoes?: number | null;
  comissaodivulgacaovalor?: number | null;
  valorfaltareceber?: number | null;
}

export interface PrintPassageiroColumn {
  key: keyof ReportPassageiroDataPrint;
  label: string;
}

interface PrintablePassageiroReportProps {
  columns: PrintPassageiroColumn[];
  passageiros: ReportPassageiroDataPrint[];
  tripNameAndDateForTitle?: string; // Added prop for dynamic title
}

const PrintablePassageiroReport: React.FC<PrintablePassageiroReportProps> = ({ 
    columns, 
    passageiros,
    tripNameAndDateForTitle 
}) => {
  
  const formatCellContent = (passageiro: ReportPassageiroDataPrint, columnKey: keyof ReportPassageiroDataPrint): string => {
    let value = passageiro[columnKey];

    if (value === null || value === undefined) return '';

    switch (columnKey) {
      case 'cpfpassageiro':
      case 'cpfindicador':
        return applyCpfMask(String(value));
      case 'telefonepassageiro':
        return applyPhoneMask(String(value));
      case 'datapartida_viagem_raw': // This is YYYY-MM-DD
      case 'datasinal': // Assumed YYYY-MM-DD from DB
      case 'dataparcela2': case 'dataparcela3': case 'dataparcela4': case 'dataparcela5':
      case 'dataparcela6': case 'dataparcela7': case 'dataparcela8': case 'dataparcela9': case 'dataparcela10':
        return formatDateForDisplayDDMMYYYY(String(value)); // Converts YYYY-MM-DD to DD/MM/AAAA
      case 'valorviagem':
      case 'valorsinal':
      case 'valorparcela2': case 'valorparcela3': case 'valorparcela4': case 'valorparcela5':
      case 'valorparcela6': case 'valorparcela7': case 'valorparcela8': case 'valorparcela9': case 'valorparcela10':
      case 'descontopromocional':
      case 'descontoindicacoes':
      case 'comissaodivulgacaovalor':
      case 'valorfaltareceber':
        return formatNumberToBRLCurrency(Number(value));
      case 'elegiveldesconto':
        return value ? 'Sim' : 'Não';
      case 'poltrona': 
        return String(value);
      default:
        return String(value);
    }
  };

  const reportTitle = tripNameAndDateForTitle 
    ? `Relatório de Passageiros - ${tripNameAndDateForTitle}`
    : "Relatório de Passageiros";
  
  return (
    <div className="print-container">
      <h1 className="print-title">{reportTitle}</h1>
      <table className="print-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {passageiros.map((passageiro, passageiroIndex) => (
            <tr key={passageiro.id || `passageiro-${passageiroIndex}`}>
              {columns.map(col => (
                <td key={`${passageiro.id}-${String(col.key)}`}>
                  {formatCellContent(passageiro, col.key)}
                </td>
              ))}
            </tr>
          ))}
          {passageiros.length === 0 && (
             <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                    Nenhum passageiro para exibir.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintablePassageiroReport;
