import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarMeusJogos, deletarJogo } from "../services/meusJogosService";
import FormMeuJogo from "./FormMeuJogo";
import "../CSS/meusJogos.css";

export default function MeusJogos() {
  const { token, usuario } = useAuth();
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);  // ← Deve começar como false
  const [jogoEditando, setJogoEditando] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    if (usuario) {
      carregarJogos();
    }
  }, [pagina, usuario]);

  async function carregarJogos() {
    setLoading(true);
    try {
      const data = await listarMeusJogos(token, usuario.id, pagina, 10);
      setJogos(data.itens || []);
      setTotalPaginas(data.paginas || 1);
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deletarJogo(id, token);
      setShowConfirm(null);
      carregarJogos();
    } catch (error) {
      alert("Erro ao deletar jogo: " + error.message);
    }
  }

  function handleEdit(jogo) {
    setJogoEditando(jogo);
    setShowForm(true);
  }

  function handleCreate() {
    setJogoEditando(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setJogoEditando(null);
    carregarJogos();
  }

  if (!usuario) {
    return <div className="meus-jogos-container">Faça login para acessar</div>;
  }

  return (
    <div className="meus-jogos-container">
      <div className="meus-jogos-header">
        <div>
          <h1>Meus Jogos</h1>
          <p>Gerencie os jogos que você criou (máximo 3)</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          + Criar Novo Jogo
        </button>
      </div>

      {showForm && (
  <FormMeuJogo
    jogo={jogoEditando}
    onClose={handleFormClose}
    token={token}
    onSave={carregarJogos}
  />
)}

      {loading ? (
        <div className="meus-jogos-loading">Carregando seus jogos...</div>
      ) : jogos.length === 0 ? (
        <div className="meus-jogos-empty">
          <p>Você ainda não criou nenhum jogo.</p>
          <p className="limit-info">Limite máximo: 3 jogos por matrícula</p>
          <button onClick={handleCreate} className="btn-primary">Criar meu primeiro jogo</button>
        </div>
      ) : (
        <>
          <div className="jogos-grid">
            {jogos.map((jogo) => (
              <div key={jogo.id} className="jogo-card">
                <img src={jogo.capaUrl} alt={jogo.titulo} className="jogo-cover" />
                <div className="jogo-info">
                  <h3>{jogo.titulo}</h3>
                  <p className="jogo-preco">R$ {jogo.preco?.toFixed(2)}</p>
                  <p className="jogo-dev">{jogo.desenvolvedora || "Desenvolvedor não informado"}</p>
                  <div className="jogo-stats">
                    <span>📸 {jogo._count?.imagens || 0}</span>
                    <span>⭐ {jogo._count?.reviews || 0}</span>
                  </div>
                  <div className="jogo-actions">
                    <button className="btn-edit" onClick={() => handleEdit(jogo)}>✏️ Editar</button>
                    <button className="btn-delete" onClick={() => setShowConfirm(jogo.id)}>🗑️ Excluir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </button>
            <span>Página {pagina} de {totalPaginas}</span>
            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <h3>Confirmar exclusão</h3>
            <p>Tem certeza que deseja excluir este jogo?</p>
            <p className="warning">Esta ação não pode ser desfeita!</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={() => handleDelete(showConfirm)}>
                Sim, excluir
              </button>
              <button className="btn-cancel" onClick={() => setShowConfirm(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}