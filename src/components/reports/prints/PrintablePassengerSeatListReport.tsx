
import React from 'react';
import { PassageiroFormData } from '../../../types'; // Adjust path as necessary
import { applyCpfMask } from '../../../utils/maskUtils';

interface PassengerSeatDataPrint extends PassageiroFormData {
  // poltrona is already in PassageiroFormData
}

interface PrintablePassengerSeatListReportProps {
  passengers: PassengerSeatDataPrint[];
  nomeViagem: string;
  dataViagem: string; // Assumed DD/MM/AAAA
}

const PrintablePassengerSeatListReport: React.FC<PrintablePassengerSeatListReportProps> = ({ passengers, nomeViagem, dataViagem }) => {
  return (
    <div className="print-container">
      <h1 className="print-title">Lista de Passageiros e Poltronas</h1>
      <h2 className="text-center text-lg font-semibold mb-3">{nomeViagem} - {dataViagem}</h2>
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '45%' }}>Nome Passageiro</th>
            <th style={{ width: '30%' }}>CPF</th>
            <th style={{ width: '25%', textAlign: 'center' }}>Poltrona</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger) => (
            <tr key={passenger.id}>
              <td>{passenger.nomepassageiro}</td>
              <td>{applyCpfMask(passenger.cpfpassageiro)}</td>
              <td style={{ textAlign: 'center' }}>{passenger.poltrona || 'N/A'}</td>
            </tr>
          ))}
           {passengers.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '10px' }}>
                Nenhum passageiro para esta viagem.
              </td>
            </tr>
          )}
        </tbody>
      </table>
       {passengers.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt' }}>
          Total de Passageiros: {passengers.length}
        </div>
      )}
    </div>
  );
};

export default PrintablePassengerSeatListReport;
