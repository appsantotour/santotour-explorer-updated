
import React from 'react';
import { applyCpfMask, formatNumberToBRLCurrency } from '../../../utils/maskUtils'; // Adjust path as needed

// Mirrored from IndicacoesReport.tsx for data structure
interface ReportReferralDataPrint {
  id: string;
  viagemDisplay: string;
  cpfIndicadorRaw: string;
  nomeIndicador: string;
  comissaoValor: number;
  cpfIndicadoRaw: string;
  nomeIndicado: string;
  dataPartidaViagemRaw?: string; // Optional, if needed later for print, but not currently in main columns
}

export interface PrintIndicacaoColumn {
  key: keyof ReportReferralDataPrint;
  label: string;
}

interface PrintableIndicacoesReportProps {
  columns: PrintIndicacaoColumn[];
  referrals: ReportReferralDataPrint[];
  reportTitle?: string;
}

const PrintableIndicacoesReport: React.FC<PrintableIndicacoesReportProps> = ({ columns, referrals, reportTitle }) => {
  const formatCellContent = (referral: ReportReferralDataPrint, columnKey: keyof ReportReferralDataPrint): string => {
    let value = referral[columnKey];

    if (value === null || value === undefined) return '';

    switch (columnKey) {
      case 'cpfIndicadorRaw':
      case 'cpfIndicadoRaw':
        return applyCpfMask(String(value));
      case 'comissaoValor':
        return formatNumberToBRLCurrency(Number(value));
      default:
        return String(value);
    }
  };

  const finalReportTitle = reportTitle || "Relatório Consolidado de Indicações";

  return (
    <div className="print-container">
      <h1 className="print-title">{finalReportTitle}</h1>
      <table className="print-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {referrals.map((referral, referralIndex) => (
            <tr key={referral.id || `referral-${referralIndex}`}>
              {columns.map(col => (
                <td key={`${referral.id}-${String(col.key)}`}>
                  {formatCellContent(referral, col.key)}
                </td>
              ))}
            </tr>
          ))}
          {referrals.length === 0 && (
             <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                    Nenhuma indicação para exibir.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableIndicacoesReport;
