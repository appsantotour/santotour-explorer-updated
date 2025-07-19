import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../integrations/supabase/client';
import InputField from '../InputField';

interface LocalEmbarque {
  id: string;
  localembarque: string;
  enderecoembarque: string;
  cidade: string | null;
  ativo?: boolean | null;
}

const StatusDot = ({ ativo }: { ativo?: boolean }) => (
  <span
    className={
      'inline-block w-3 h-3 rounded-full mr-2 ' +
      (ativo ? 'bg-green-500' : 'bg-red-500')
    }
    title={ativo ? 'Ativo' : 'Inativo'}
  />
);

const StatusSwitch: React.FC<{ ativo: boolean; onToggle: () => void; saving: boolean }> = ({ ativo, onToggle, saving }) => (
  <button
    onClick={onToggle}
    disabled={saving}
    className={`flex items-center px-2 py-1 rounded transition-colors duration-150 focus:outline-none ${ativo ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'} ${saving ? 'opacity-50 cursor-wait' : ''}`}
    title={ativo ? 'Clique para inativar' : 'Clique para ativar'}
    type="button"
  >
    <StatusDot ativo={ativo} />
    <span className={`font-semibold ${ativo ? 'text-green-700' : 'text-red-700'}`}>{ativo ? 'Ativo' : 'Inativo'}</span>
    {saving && <span className="ml-2 text-xs text-gray-400">Salvando...</span>}
  </button>
);

const LocaisEmbarqueReport: React.FC = () => {
  const [locais, setLocais] = useState<LocalEmbarque[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof LocalEmbarque | 'ativo'; direction: 'asc' | 'desc' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ localembarque: string; enderecoembarque: string }>({ localembarque: '', enderecoembarque: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicia edição do local selecionado
  const startEdit = (local: LocalEmbarque) => {
    if (editingId) return; // Impede edição concorrente
    setEditingId(local.id);
    setEditValues({
      localembarque: local.localembarque,
      enderecoembarque: local.enderecoembarque,
    });
    setEditError(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Cancela edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ localembarque: '', enderecoembarque: '' });
    setEditError(null);
  };

  // Salva edição no Supabase e atualiza localmente
  const saveEdit = async () => {
    if (!editingId) return;
    const { localembarque, enderecoembarque } = editValues;
    if (!localembarque.trim() || !enderecoembarque.trim()) {
      setEditError('Preencha ambos os campos.');
      return;
    }
    setSavingId(editingId);
    const { error } = await supabase
      .from('locais_embarque')
      .update({ localembarque: localembarque.trim(), enderecoembarque: enderecoembarque.trim() })
      .eq('id', editingId);
    if (!error) {
      setLocais(prev => prev.map(l => l.id === editingId ? { ...l, localembarque: localembarque.trim(), enderecoembarque: enderecoembarque.trim() } : l));
      cancelEdit();
    } else {
      setEditError('Erro ao salvar. Tente novamente.');
    }
    setSavingId(null);
  };

  // Salva ao sair do campo (blur) ou pressionar Enter
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };
  const handleEditBlur = () => {
    // Só salva se não for o botão de cancelar
    setTimeout(() => {
      if (document.activeElement?.id !== 'cancel-edit-btn') {
        saveEdit();
      }
    }, 100);
  };

  // Ordenação dinâmica
  const sortedLocais = React.useMemo(() => {
    if (!sortConfig) return locais;
    const sorted = [...locais];
    sorted.sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'ativo') {
        aValue = a.ativo ? 1 : 0;
        bValue = b.ativo ? 1 : 0;
      } else {
        aValue = (a[sortConfig.key] || '').toString().toLowerCase();
        bValue = (b[sortConfig.key] || '').toString().toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [locais, sortConfig]);

  const handleSort = (key: keyof LocalEmbarque | 'ativo') => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  useEffect(() => {
    const fetchLocais = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('locais_embarque')
        .select('id, localembarque, enderecoembarque, cidade, ativo');
      if (!error && data) {
        setLocais(data);
      }
      setLoading(false);
    };
    fetchLocais();
  }, []);

  // Alterna o status ativo/inativo no Supabase e atualiza no estado local
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setSavingId(id);
    const { error } = await supabase
      .from('locais_embarque')
      .update({ ativo: !currentStatus })
      .eq('id', id);
    if (!error) {
      setLocais(prev => prev.map(l => l.id === id ? { ...l, ativo: !currentStatus } : l));
    }
    setSavingId(null);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Relatório de Locais de Embarque</h2>
      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          {editError && (
            <div className="text-red-600 text-sm mb-2">{editError}</div>
          )}
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort('localembarque')}>
                  LOCAL {sortConfig?.key === 'localembarque' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 text-left">ENDEREÇO</th>
                <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort('cidade')}>
                  CIDADE {sortConfig?.key === 'cidade' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort('ativo')}>
                  STATUS {sortConfig?.key === 'ativo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLocais.map(local => (
                <tr key={local.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {editingId === local.id ? (
                      <InputField
                        id={`edit-localembarque-${local.id}`}
                        name="localembarque"
                        label=""
                        value={editValues.localembarque}
                        onChange={e => setEditValues(ev => ({ ...ev, localembarque: e.target.value }))}
                        className="w-40"
                        inputClassName="text-xs"
                        maxLength={100}
                        required
                        autoFocus
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditBlur}
                        inputRef={inputRef}
                        disabled={savingId === local.id}
                      />
                    ) : (
                      <span onDoubleClick={() => startEdit(local)} className="cursor-pointer" title="Clique duas vezes para editar">{local.localembarque}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === local.id ? (
                      <InputField
                        id={`edit-enderecoembarque-${local.id}`}
                        name="enderecoembarque"
                        label=""
                        value={editValues.enderecoembarque}
                        onChange={e => setEditValues(ev => ({ ...ev, enderecoembarque: e.target.value }))}
                        className="w-56"
                        inputClassName="text-xs"
                        maxLength={150}
                        required
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleEditBlur}
                        disabled={savingId === local.id}
                      />
                    ) : (
                      <span onDoubleClick={() => startEdit(local)} className="cursor-pointer" title="Clique duas vezes para editar">{local.enderecoembarque}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{local.cidade || ''}</td>
                  <td className="px-4 py-2">
                    <StatusSwitch
                      ativo={!!local.ativo}
                      onToggle={() => handleToggleStatus(local.id, !!local.ativo)}
                      saving={savingId === local.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LocaisEmbarqueReport;
