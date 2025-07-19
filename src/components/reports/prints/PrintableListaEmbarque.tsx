
import React from 'react';
import { Clock, Home, Users, Bus, AlertTriangle } from 'lucide-react';

interface PassengerNamePrint {
  primeiroNome: string;
}
interface BoardingLocationPrint {
  id: string;
  localembarque: string;
  enderecoembarque: string;
  passageiros: PassengerNamePrint[];
  horario: string;
}

interface PrintableListaEmbarqueProps {
  viagemNome: string;
  viagemData: string; // DD/MM/AAAA
  boardingLocations: BoardingLocationPrint[];
}

const PrintableListaEmbarque: React.FC<PrintableListaEmbarqueProps> = ({ viagemNome, viagemData, boardingLocations }) => {
  return (
    <div className="print-container p-0" style={{ padding: '20mm', boxSizing: 'border-box' }}> {/* A4-like padding */}
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact; /* Chrome, Safari */
              color-adjust: exact; /* Firefox */
            }
            .print-container {
              width: 100%;
              margin: 0;
              padding: 0; /* Reset padding for full page control */
              border: none;
            }
            .no-print-in-printable { display: none !important; }
            .card-print {
              page-break-inside: avoid;
              border: 1px solid #a0aec0; /* gray-500 */
              border-radius: 0.5rem; /* rounded-lg */
              padding: 1rem; /* p-4 */
              margin-bottom: 0.75rem; /* mb-3 */
              background-color: #ffffff !important; /* bg-white */
            }
            .print-header-alert {
              background-color: #c6f6d5 !important; /* bg-green-100 */
              border-left: 4px solid #48bb78 !important; /* border-green-500 */
              color: #2f855a !important; /* text-green-700 */
              padding: 0.75rem; /* p-3 */
              border-radius: 0.375rem; /* rounded-md */
              margin-bottom: 1rem; /* mb-4 */
            }
             .print-footer-message {
                margin-top: 1.5rem; /* mt-6 */
                text-align: center;
                font-size: 0.875rem; /* text-sm */
                font-weight: 600; /* font-semibold */
                color: #2b6cb0 !important; /* text-blue-700 */
                padding: 0.75rem; /* p-3 */
                background-color: #ebf8ff !important; /* bg-blue-50 */
                border-radius: 0.375rem; /* rounded-md */
            }
          }
        `}
      </style>
      <h1 className="print-title text-xl font-bold mb-1">Lista de Embarques</h1>
      <p className="text-center text-sm text-gray-700 mb-3">{viagemNome} - {viagemData}</p>

      <div className="print-header-alert flex items-center">
        <AlertTriangle size={20} className="mr-2 text-green-600" />
        <p className="text-sm font-medium">Favor chegar nos pontos de embarque com 15 minutos de antecedência!</p>
      </div>

      {boardingLocations.map((item) => (
        <div key={item.id} className="card-print">
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <div className="flex items-center mb-1">
                <Bus size={18} className="text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-800">{item.localembarque}</h3>
              </div>
              <div className="flex items-center text-xs text-gray-600 mb-1 ml-1">
                <Home size={12} className="mr-1.5" />
                <span>{item.enderecoembarque || 'Endereço não informado'}</span>
              </div>
              <div className="flex items-start text-xs text-gray-600 ml-1">
                <Users size={12} className="mr-1.5 mt-0.5 flex-shrink-0" />
                <p className="leading-snug">
                  {item.passageiros.map(p => p.primeiroNome).join(', ')}
                  {item.passageiros.length > 0 ? ` (${item.passageiros.length} passageiro${item.passageiros.length > 1 ? 's' : ''})` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center ml-3">
              <Clock size={16} className="text-gray-500 mr-1.5" />
              <span className="text-sm font-medium">{item.horario === '--:--' ? 'A definir' : item.horario}</span>
            </div>
          </div>
        </div>
      ))}
      {boardingLocations.length === 0 && (
        <p className="text-center text-gray-600 my-4">Nenhum local de embarque para esta viagem.</p>
      )}
       <div className="print-footer-message">
            <Bus size={18} className="inline mr-2" />
            A Santo Tour deseja a todos uma excelente viagem!
        </div>
    </div>
  );
};

export default PrintableListaEmbarque;
