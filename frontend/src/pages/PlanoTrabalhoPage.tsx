import React, { useEffect, useState } from 'react';
import planoService from '../services/planoTrabalhoService';
import type { PlanoTrabalho } from '../types/planoTrabalho.types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PlanoTrabalhoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const instituicaoId = searchParams.get('instituicaoId') || '';
  const [planos, setPlanos] = useState<PlanoTrabalho[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [showReprovarModal, setShowReprovarModal] = useState(false);
  const [selectedPlanoId, setSelectedPlanoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  const isGestor = user?.role === 'GESTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!instituicaoId) return;
    fetchPlanos();
  }, [instituicaoId]);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const data = await planoService.listByInstituicao(instituicaoId);
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos', error);
      alert('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Planos de Trabalho</h1>
        <div>
          <button onClick={() => navigate(`/dashboard/cadastro-dados-institucionais?id=${instituicaoId}`)} className="px-4 py-2 bg-gray-200 rounded mr-2">Voltar</button>
          <button onClick={() => navigate(`/dashboard/novo-plano?instituicaoId=${instituicaoId}`)} className="px-4 py-2 bg-blue-600 text-white rounded">+ Novo Plano</button>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {planos.map(p => (
            <div key={p.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{p.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.descricao}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{p.status}</div>
                  <div className="mt-2">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded mr-2" onClick={() => navigate(`/dashboard/visualizar-plano?id=${p.id}`)}>Visualizar</button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded mr-2" onClick={() => navigate(`/dashboard/editar-plano?id=${p.id}`)}>Editar</button>
                    {isGestor && p.status !== 'APROVADO' && (
                      <>
                        <button className="px-3 py-1 bg-emerald-600 text-white rounded mr-2" onClick={() => { setSelectedPlanoId(p.id); setMotivo(''); setShowAprovarModal(true); }}>Aprovar</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => { setSelectedPlanoId(p.id); setMotivo(''); setShowReprovarModal(true); }}>Reprovar</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aprovar modal */}
      {showAprovarModal && selectedPlanoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Aprovar Plano</h3>
            <textarea className="w-full border rounded p-2" rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo da aprovação (obrigatório)" />
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 mr-2 border rounded" onClick={() => setShowAprovarModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={async () => {
                if (!motivo.trim()) { alert('Informe o motivo'); return; }
                try { await planoService.aprovar(selectedPlanoId, motivo); setShowAprovarModal(false); fetchPlanos(); } catch (err) { console.error(err); alert('Erro ao aprovar'); }
              }}>Aprovar</button>
            </div>
          </div>
        </div>
      )}

      {/* Reprovar modal */}
      {showReprovarModal && selectedPlanoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reprovar Plano</h3>
            <textarea className="w-full border rounded p-2" rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo da reprovação (obrigatório)" />
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 mr-2 border rounded" onClick={() => setShowReprovarModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={async () => {
                if (!motivo.trim()) { alert('Informe o motivo'); return; }
                try { await planoService.reprovar(selectedPlanoId, motivo); setShowReprovarModal(false); fetchPlanos(); } catch (err) { console.error(err); alert('Erro ao reprovar'); }
              }}>Reprovar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoTrabalhoPage;
