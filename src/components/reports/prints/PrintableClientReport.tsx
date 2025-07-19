import React from 'react';
import { ClientFormData } from '../../../types';

export interface PrintColumn {
  key: string;
  label: string;
}

interface PrintableClientReportProps {
  columns: PrintColumn[];
  clients: ClientFormData[];
}

const PrintableClientReport: React.FC<PrintableClientReportProps> = ({ columns, clients }) => {
  return (
    <div className="print-only">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Relatório de Clientes</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="border border-gray-300 p-2 bg-gray-100 text-left">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id || client.cpf}>
                {columns.map((col) => (
                  <td key={col.key} className="border border-gray-300 p-2">
                    {String(client[col.key as keyof ClientFormData] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintableClientReport;