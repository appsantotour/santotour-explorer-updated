
import React from 'react';
import { parseBRLCurrency, formatNumberToBRLCurrency } from '../../../utils/maskUtils'; // Added imports

// Define the structure for trip data specifically for printing
interface ReportTripDataPrint {
  id: string;
  destino: string;
  datapartida: string; // Should be DD/MM/AAAA
  dataretorno: string; // Should be DD/MM/AAAA
  precodefinido: string; // Should be BRL formatted string
  qtdepagantesreal: number;
  receitatotalreal?: string; // Optional, if needed for other columns
  despesatotalreal?: string; // Optional, if needed for other columns
  lucrobrutoreal?: string; // Optional, if needed for other columns
  comissaomaxdivulgacao?: string; // This key will be used for "Desc. e Comissões"
  lucroliquidoreal?: string; // Optional, if needed for other columns
  totaldescontosreal?: string; // Ensure this is part of the interface, BRL formatted
  totalindicacoesreal?: string; // Ensure this is part of the interface, BRL formatted
}

// Define the structure for column configuration for printing
export interface PrintTripColumn {
  key: keyof ReportTripDataPrint;
  label: string;
}

interface PrintableTripReportProps {
  columns: PrintTripColumn[];
  trips: ReportTripDataPrint[];
}

const PrintableTripReport: React.FC<PrintableTripReportProps> = ({ columns, trips }) => {
  return (
    <div className="print-container">
      <h1 className="print-title">Relatório de Viagens</h1>
      <table className="print-table">
        <thead>
          <tr>
            {columns.map(col => {
              // Modify label for 'comissaomaxdivulgacao' key
              const label = col.key === 'comissaomaxdivulgacao' ? 'Desc. e Comissões' : col.label;
              return <th key={String(col.key)}>{label}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {trips.map((trip, tripIndex) => (
            <tr key={trip.id || `trip-${tripIndex}`}>
              {columns.map(col => {
                let cellValue = '';
                if (col.key === 'comissaomaxdivulgacao') {
                  const descontosNum = parseBRLCurrency(trip.totaldescontosreal) || 0;
                  const indicacoesNum = parseBRLCurrency(trip.totalindicacoesreal) || 0;
                  cellValue = formatNumberToBRLCurrency(descontosNum + indicacoesNum);
                } else {
                  // Access the value directly using the key from ReportTripDataPrint
                  const rawValue = trip[col.key];
                  cellValue = rawValue !== null && rawValue !== undefined 
                                    ? String(rawValue) 
                                    : '';
                }
                return <td key={`${trip.id}-${String(col.key)}`}>{cellValue}</td>;
              })}
            </tr>
          ))}
          {trips.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '10px' }}>
                Nenhuma viagem para exibir.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableTripReport;
