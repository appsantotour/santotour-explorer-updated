import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { formatNumberToBRLCurrency, applyCpfMask } from '../../utils/maskUtils';
import { formatDateForDisplayDDMMYYYY } from '../../utils/dateUtils';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface IndicadorData {
  cpfIndicador: string;
  nomeIndicador: string;
  totalComissaoIndicador: number;
  viagens: ViagemIndicador[];
}

interface ViagemIndicador {
  idViagem: string;
  destino: string;
  dataPartida: string; // DD/MM/AAAA format
  subTotalComissaoViagem: number;
  indicacoes: IndicacaoDetalhe[];
}

interface IndicacaoDetalhe {
  cpfIndicado: string;
  nomeIndicado: string;
  valorComissao: number;
}

const IndicadoresReport: React.FC = () => {
  const [indicadoresData, setIndicadoresData] = useState<IndicadorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [expandedIndicadores, setExpandedIndicadores] = useState<Set<string>>(new Set());
  const [expandedViagens, setExpandedViagens] = useState<Set<string>>(new Set()); // Key: "indicadorCpf-viagemId"

  useEffect(() => {
    const fetchData = async () => {
      // Remove Supabase configuration check since it's always configured
      setIsLoading(true);

      try {
        const { data: passageirosIndicados, error: passageirosError } = await supabase
          .from('passageiros')
          .select('idviagem, cpfpassageiro, nomepassageiro, cpfindicador, comissaodivulgacaovalor')
          .not('cpfindicador', 'is', null)
          .gt('comissaodivulgacaovalor', 0);

        if (passageirosError) throw passageirosError;
        if (!passageirosIndicados || passageirosIndicados.length === 0) {
          setIndicadoresData([]);
          setIsLoading(false);
          toast({ title: "Sem Dados", description: "Nenhuma indicação com comissão encontrada." });
          return;
        }

        const indicadorCpfs = [...new Set(passageirosIndicados.map(p => p.cpfindicador).filter(Boolean) as string[])];
        const tripIds = [...new Set(passageirosIndicados.map(p => p.idviagem).filter(Boolean) as string[])];

        let indicadoresMap = new Map<string, string>();
        if (indicadorCpfs.length > 0) {
          const { data: clientesData, error: clientesError } = await supabase
            .from('clientes')
            .select('cpf, nome')
            .in('cpf', indicadorCpfs);
          if (clientesError) throw clientesError;
          clientesData?.forEach(c => indicadoresMap.set(c.cpf, c.nome));
        }

        let viagensMap = new Map<string, { destino: string; dataPartida: string }>();
        if (tripIds.length > 0) {
          const { data: viagensData, error: viagensError } = await supabase
            .from('viagens')
            .select('id, destino, datapartida')
            .in('id', tripIds);
          if (viagensError) throw viagensError;
          viagensData?.forEach(v => viagensMap.set(v.id, {
            destino: v.destino || 'Destino Desconhecido',
            dataPartida: formatDateForDisplayDDMMYYYY(v.datapartida)
          }));
        }

        const structuredData: Record<string, Omit<IndicadorData, 'cpfIndicador' | 'nomeIndicador'>> = {};

        for (const p of passageirosIndicados) {
          if (!p.cpfindicador || !p.idviagem || p.comissaodivulgacaovalor == null) continue;

          const cpfIndicador = p.cpfindicador;
          if (!structuredData[cpfIndicador]) {
            structuredData[cpfIndicador] = {
              totalComissaoIndicador: 0,
              viagens: [],
            };
          }

          let viagemIndicador = structuredData[cpfIndicador].viagens.find(v => v.idViagem === p.idviagem);
          const tripDetails = viagensMap.get(p.idviagem);

          if (!viagemIndicador && tripDetails) {
            viagemIndicador = {
              idViagem: p.idviagem,
              destino: tripDetails.destino,
              dataPartida: tripDetails.dataPartida,
              subTotalComissaoViagem: 0,
              indicacoes: [],
            };
            structuredData[cpfIndicador].viagens.push(viagemIndicador);
          }

          if (viagemIndicador) {
            const comissaoValor = Number(p.comissaodivulgacaovalor);
            viagemIndicador.indicacoes.push({
              cpfIndicado: p.cpfpassageiro,
              nomeIndicado: p.nomepassageiro,
              valorComissao: comissaoValor,
            });
            viagemIndicador.subTotalComissaoViagem += comissaoValor;
            structuredData[cpfIndicador].totalComissaoIndicador += comissaoValor;
          }
        }

        const finalDataArray: IndicadorData[] = Object.entries(structuredData)
          .map(([cpf, data]) => ({
            cpfIndicador: cpf,
            nomeIndicador: indicadoresMap.get(cpf) || 'Indicador Desconhecido',
            ...data,
          }))
          .sort((a, b) => b.totalComissaoIndicador - a.totalComissaoIndicador);

        setIndicadoresData(finalDataArray);

      } catch (error: any) {
        console.error("Erro ao buscar dados para relatório de indicações:", error);
        toast({ title: "Erro ao Gerar Relatório", description: error.message, variant: "destructive" });
        setIndicadoresData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const toggleIndicadorExpansion = (cpfIndicador: string) => {
    setExpandedIndicadores(prev => {
      const newSet = new Set(prev);
      newSet.has(cpfIndicador) ? newSet.delete(cpfIndicador) : newSet.add(cpfIndicador);
      return newSet;
    });
  };
  
  const toggleViagemExpansion = (indicadorCpf: string, viagemId: string) => {
    const key = `${indicadorCpf}-${viagemId}`;
    setExpandedViagens(prev => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-700">Gerando relatório de indicações...</p>
      </div>
    );
  }

  if (indicadoresData.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center text-2xl">🏆</div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma Indicação Encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">Não há dados de indicações com comissão para exibir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-4 bg-gray-100 min-h-screen">
      {indicadoresData.map((indicador) => (
        <div key={indicador.cpfIndicador} className="bg-white shadow-xl rounded-lg border border-gray-200">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleIndicadorExpansion(indicador.cpfIndicador)}
            aria-expanded={expandedIndicadores.has(indicador.cpfIndicador)}
            aria-controls={`indicador-details-${indicador.cpfIndicador}`}
          >
            <div className="flex items-center">
              <div className="mr-2 text-blue-700 w-5 h-5 flex items-center justify-center">👤</div>
              <span className="font-semibold text-gray-800 text-sm sm:text-base">
                {indicador.nomeIndicador} ({applyCpfMask(indicador.cpfIndicador)})
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-green-600 mr-2 text-sm sm:text-base">
                {formatNumberToBRLCurrency(indicador.totalComissaoIndicador)}
              </span>
              {expandedIndicadores.has(indicador.cpfIndicador) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {expandedIndicadores.has(indicador.cpfIndicador) && (
            <div id={`indicador-details-${indicador.cpfIndicador}`} className="p-3 sm:p-4 space-y-3">
              {indicador.viagens.sort((a,b) => new Date(b.dataPartida.split('/').reverse().join('-')).getTime() - new Date(a.dataPartida.split('/').reverse().join('-')).getTime()).map((viagem) => (
                <div key={viagem.idViagem} className="bg-gray-50 rounded-md border border-gray-300">
                  <div 
                    className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleViagemExpansion(indicador.cpfIndicador, viagem.idViagem)}
                    aria-expanded={expandedViagens.has(`${indicador.cpfIndicador}-${viagem.idViagem}`)}
                    aria-controls={`viagem-details-${indicador.cpfIndicador}-${viagem.idViagem}`}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {viagem.destino} ({viagem.dataPartida})
                      </span>
                    </div>
                     <div className="flex items-center">
                        <span className="text-xs sm:text-sm font-semibold text-green-500 mr-2">
                            {formatNumberToBRLCurrency(viagem.subTotalComissaoViagem)}
                        </span>
                        {expandedViagens.has(`${indicador.cpfIndicador}-${viagem.idViagem}`) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {expandedViagens.has(`${indicador.cpfIndicador}-${viagem.idViagem}`) && (
                     <div id={`viagem-details-${indicador.cpfIndicador}-${viagem.idViagem}`} className="p-2 sm:p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {viagem.indicacoes.map((indicacao, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-medium text-gray-700 truncate" title={indicacao.nomeIndicado}>
                                {indicacao.nomeIndicado}
                              </p>
                              <p className="text-xxs sm:text-xs text-gray-500">{applyCpfMask(indicacao.cpfIndicado)}</p>
                            </div>
                            <p className="text-xs font-semibold text-green-600 mt-1 self-start">
                              {formatNumberToBRLCurrency(indicacao.valorComissao)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {indicador.viagens.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Nenhuma comissão registrada para este indicador nas viagens filtradas.</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IndicadoresReport;
