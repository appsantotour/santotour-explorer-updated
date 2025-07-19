
import React from 'react';
import { applyCpfMask, formatNumberToBRLCurrency } from '../../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY } from '../../../utils/dateUtils';

// Mirrored from PagamentosReport.tsx
interface FormattedPaymentPrint {
  id: string;
  viagemId: string;
  nomeViagemDisplay: string;
  dataPartidaViagemRaw: string; // This field will no longer be actively used/displayed based on recent changes
  nomePassageiro: string;
  cpfPassageiroRaw: string;
  tipoPagamento: string;
  dataPagamentoDisplay: string;
  dataPagamentoRaw: string; // Keep for potential use, though display is preferred
  valorPagamento: number;
  observacaoPagamento?: string | null;
  saldo?: number; // Added SALDO field
}

export interface PrintPagamentoColumn {
  key: keyof FormattedPaymentPrint;
  label: string;
}

interface PrintablePagamentosReportProps {
  columns: PrintPagamentoColumn[];
  payments: FormattedPaymentPrint[];
  reportTitle?: string;
}

const PrintablePagamentosReport: React.FC<PrintablePagamentosReportProps> = ({ columns, payments, reportTitle }) => {
  // Função para formatar o saldo com o sinal correto
  const formatSaldo = (value: number): string => {
    if (value > 0) return `-${formatNumberToBRLCurrency(value)}`; // Adiciona sinal negativo se for positivo
    if (value < 0) return `+${formatNumberToBRLCurrency(Math.abs(value))}`; // Adiciona sinal positivo se for negativo
    return formatNumberToBRLCurrency(value); // Mantém o valor zero sem sinal
  };

  const formatCellContent = (payment: FormattedPaymentPrint, columnKey: keyof FormattedPaymentPrint): string => {
    let value = payment[columnKey];

    if (value === null || value === undefined) return '';

    switch (columnKey) {
      case 'cpfPassageiroRaw':
        return applyCpfMask(String(value));
      case 'valorPagamento':
        return formatNumberToBRLCurrency(Number(value));
      case 'saldo':
        return formatSaldo(Number(value));
      case 'dataPagamentoRaw': // This is YYYY-MM-DD
        return formatDateForDisplayDDMMYYYY(String(value));
      // For pre-formatted display strings:
      case 'dataPagamentoDisplay':
      case 'nomeViagemDisplay':
        return String(value);
      default:
        // Handle dataPartidaViagemRaw if it's somehow still passed, though it shouldn't be if column config is correct
        if (columnKey === 'dataPartidaViagemRaw') { 
            return formatDateForDisplayDDMMYYYY(String(value));
        }
        return String(value);
    }
  };
  
  const finalReportTitle = reportTitle || "Relatório de Pagamentos";

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
          {payments.map((payment, paymentIndex) => (
            <tr key={payment.id || `payment-${paymentIndex}`}>
              {columns.map(col => (
                <td key={`${payment.id}-${String(col.key)}`}>
                  {formatCellContent(payment, col.key)}
                </td>
              ))}
            </tr>
          ))}
          {payments.length === 0 && (
             <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                    Nenhum pagamento para exibir.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintablePagamentosReport;
