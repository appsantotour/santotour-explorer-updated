
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { ViagensFormData } from '../../types'; // Using ViagensFormData as it contains all necessary fields
import { formatDateForDisplayDDMMYYYY } from '../../utils/dateUtils';
import { formatNumberToBRLCurrency } from '../../utils/maskUtils';
import { CreditCard, CalendarDays, DollarSign, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportSection {
  nome: string;
  despesaKey: keyof ViagensFormData;
  adiantamentoKey: keyof ViagensFormData;
}

const reportSectionsConfig: ReportSection[] = [
  { nome: "Taxas", despesaKey: "totaldespesastaxas", adiantamentoKey: "adiantamentotaxas" },
  { nome: "Transporte", despesaKey: "frete", adiantamentoKey: "adiantamentotransporte" },
  { nome: "Motoristas", despesaKey: "totaldespesasmotoristas", adiantamentoKey: "adiantamentomotoristas" },
  { nome: "Traslados", despesaKey: "totaldespesastraslados", adiantamentoKey: "adiantamentotraslados" },
  { nome: "Hospedagem", despesaKey: "totaldespesashospedagem", adiantamentoKey: "adiantamentohospedagem" },
  { nome: "Passeios e Ingressos", despesaKey: "totaldespesaspasseios", adiantamentoKey: "adiantamentopasseios" },
  { nome: "Brindes e Extras", despesaKey: "totaldespesasbrindeesextras", adiantamentoKey: "adiantamentobrindes" },
  { nome: "Sorteios", despesaKey: "totaldespesassorteios", adiantamentoKey: "adiantamentosorteios" },
  { nome: "Outras Despesas", despesaKey: "despesasdiversas", adiantamentoKey: "adiantamentodespesasdiversas" },
];

interface ProcessedTripData {
  id: string;
  destino: string;
  datapartida: string; // Formatted for display
  secoes: Array<{
    nome: string;
    totalDespesa: number;
    adiantamento: number;
    restanteAPagar: number;
  }>;
  totalAdiantamentosViagem: number;
  totalRestanteAPagarViagem: number;
  overallDespesaTotalViagem: number; // Sum of all despesaKey values
}

const AdiantamentosReport: React.FC = () => {
  const [processedTrips, setProcessedTrips] = useState<ProcessedTripData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndProcessTrips = async () => {
      // Remove Supabase configuration check since it's always configured
      setIsLoading(true);

      const { data: viagensData, error } = await supabase
        .from('viagens')
        .select('*') // Select all fields to ensure keys from config are available
        .order('datapartida', { ascending: false }); // Most recent first

      if (error) {
        toast({ title: "Erro ao buscar viagens", description: error.message, variant: "destructive" });
        setProcessedTrips([]);
        setIsLoading(false);
        return;
      }

      if (viagensData) {
        const processed = viagensData.map(viagem => {
          let totalAdiantamentosViagem = 0;
          let totalRestanteAPagarViagem = 0;
          let overallDespesaTotalViagem = 0;

          const secoes = reportSectionsConfig.map(section => {
            const totalDespesa = parseFloat(String(viagem[section.despesaKey as keyof typeof viagem] || 0));
            const adiantamento = parseFloat(String(viagem[section.adiantamentoKey as keyof typeof viagem] || 0));
            const restanteAPagar = totalDespesa - adiantamento;

            totalAdiantamentosViagem += adiantamento;
            totalRestanteAPagarViagem += restanteAPagar;
            overallDespesaTotalViagem += totalDespesa;

            return {
              nome: section.nome,
              totalDespesa,
              adiantamento,
              restanteAPagar,
            };
          });

          return {
            id: viagem.id,
            destino: viagem.destino || 'Destino não informado',
            datapartida: formatDateForDisplayDDMMYYYY(viagem.datapartida),
            secoes,
            totalAdiantamentosViagem,
            totalRestanteAPagarViagem,
            overallDespesaTotalViagem,
          };
        });
        setProcessedTrips(processed);
      }
      setIsLoading(false);
    };

    fetchAndProcessTrips();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700">Carregando relatório de adiantamentos...</p>
      </div>
    );
  }

  if (processedTrips.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma Viagem Encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">Não há dados de viagens para exibir no relatório de adiantamentos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-4 bg-gray-50 min-h-screen">
      {processedTrips.map((trip) => (
        <div key={trip.id} className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 p-4 text-white">
            <h3 className="text-xl font-bold flex items-center">
              <CreditCard size={24} className="mr-2" />
              {trip.destino}
            </h3>
            <p className="text-sm opacity-90 flex items-center">
              <CalendarDays size={16} className="mr-1.5" />
              Partida: {trip.datapartida}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seção</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Despesa Total (R$)</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Adiantamento (R$)</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Restante a Pagar (R$)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trip.secoes.map((secao) => (
                  <tr key={secao.nome} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{secao.nome}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatNumberToBRLCurrency(secao.totalDespesa)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatNumberToBRLCurrency(secao.adiantamento)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${secao.restanteAPagar > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumberToBRLCurrency(secao.restanteAPagar)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3 text-left text-sm font-bold text-gray-800 uppercase">Totais da Viagem</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">{formatNumberToBRLCurrency(trip.overallDespesaTotalViagem)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-blue-700 flex items-center justify-end">
                    <DollarSign size={16} className="mr-1 opacity-70" />
                    {formatNumberToBRLCurrency(trip.totalAdiantamentosViagem)}
                  </td>
                  <td className={`px-4 py-3 text-right text-sm font-bold ${trip.totalRestanteAPagarViagem > 0 ? 'text-red-700' : 'text-green-700'} flex items-center justify-end`}>
                     {trip.totalRestanteAPagarViagem > 0 ? 
                        <TrendingDown size={16} className="mr-1 opacity-70" /> :
                        <CheckCircle size={16} className="mr-1 opacity-70" /> 
                     }
                    {formatNumberToBRLCurrency(trip.totalRestanteAPagarViagem)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Placeholder for Loader2 if not imported from lucide-react
const Loader2: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);


export default AdiantamentosReport;
