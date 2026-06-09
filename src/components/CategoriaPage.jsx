// src/components/CategoriaPage.jsx - Versão com grid e modal
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../CSS/CategoriaPage.css";

export default function CategoriaPage() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const categoriaToNomeGenero = {
    "acao": "Ação",
    "rpg": "RPG",
    "aventura": "Aventura",
    "terror": "Terror",
    "coop": "Cooperativo"
  };

  useEffect(() => {
    async function carregarJogos() {
      setLoading(true);
      
      try {
        let todosJogos = [];
        let pagina = 1;
        let totalPaginas = 1;
        
        while (pagina <= totalPaginas) {
          const jogosRes = await fetch(`${API}/jogos?pagina=${pagina}&limite=100`);
          if (jogosRes.ok) {
            const data = await jogosRes.json();
            totalPaginas = data.paginas || 1;
            const jogosPagina = data.itens || [];
            todosJogos = [...todosJogos, ...jogosPagina];
          }
          pagina++;
        }
        
        const nomeGeneroAlvo = categoriaToNomeGenero[categoria];
        
        const filtrados = todosJogos.filter(jogo => {
          if (jogo.generos && Array.isArray(jogo.generos)) {
            return jogo.generos.some(genero => {
              const nomeGenero = genero.nome || genero.descricao;
              return nomeGenero === nomeGeneroAlvo;
            });
          }
          return false;
        });
        
        setJogos(filtrados);
        
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    
    carregarJogos();
  }, [categoria]);

  function getNomeCategoria(cat) {
    const nomes = {
      "acao": "🎮 Ação",
      "rpg": "🗡️ RPG",
      "aventura": "🌍 Aventura",
      "terror": "👻 Terror",
      "coop": "👥 Cooperativo"
    };
    return nomes[cat] || cat;
  }

  function abrirModal(jogo) {
    setJogoSelecionado(jogo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setJogoSelecionado(null);
  }

  if (loading) {
    return (
      <div className="categoria-loading">
        <div className="spinner"></div>
        <p>Carregando jogos de {getNomeCategoria(categoria)}...</p>
      </div>
    );
  }

  return (
    <div className="categoria-page">
      <div className="categoria-header">
        <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
        <h1>{getNomeCategoria(categoria)}</h1>
        <p>{jogos.length} jogos encontrados</p>
      </div>

      <div className="categoria-content">
        {jogos.length === 0 ? (
          <div className="nenhum-jogo">
            <p>Nenhum jogo encontrado com o gênero "{categoriaToNomeGenero[categoria]}"</p>
          </div>
        ) : (
          <div className="jogos-grid">
            {jogos.map((jogo) => (
              <div key={jogo.id} className="jogo-card" onClick={() => abrirModal(jogo)}>
                <div className="jogo-card-imagem-wrapper">
                  <img 
                    src={jogo.capaUrl || "https://via.placeholder.com/280x160/1a6eff/white?text=Sem+Imagem"} 
                    alt={jogo.titulo}
                    className="jogo-card-imagem"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/280x160/1a6eff/white?text=Sem+Imagem";
                    }}
                  />
                  <div className="jogo-card-overlay">
                    <button className="btn-overlay">Ver detalhes</button>
                  </div>
                </div>
                <div className="jogo-card-info">
                  <h3 className="jogo-card-titulo">{jogo.titulo}</h3>
                  <div className="jogo-card-generos">
                    {jogo.generos && jogo.generos.map((gen, idx) => (
                      <span key={idx} className="genero-badge">
                        {gen.nome || gen.descricao}
                      </span>
                    ))}
                  </div>
                  <p className="jogo-card-descricao">
                    {jogo.descricao?.substring(0, 100) || "Sem descrição"}
                    {jogo.descricao?.length > 100 ? "..." : ""}
                  </p>
                </div>
                <div className="jogo-card-footer">
                  <span className="jogo-card-preco">
                    {jogo.preco ? `R$ ${jogo.preco}` : "Grátis"}
                  </span>
                  {jogo.desconto && (
                    <span className="jogo-card-desconto">-{jogo.desconto}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {modalAberto && jogoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>✕</button>
            <div 
              className="modal-banner"
              style={{ backgroundImage: `url(${jogoSelecionado.capaUrl || "https://via.placeholder.com/800x250"})` }}
            >
              <div className="modal-banner-overlay">
                <h2>{jogoSelecionado.titulo}</h2>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">Gênero</span>
                  <span className="modal-info-value">
                    {jogoSelecionado.generos?.map(g => g.nome).join(", ") || "Não informado"}
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Desenvolvedora</span>
                  <span className="modal-info-value">{jogoSelecionado.desenvolvedora || "Não informado"}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Lançamento</span>
                  <span className="modal-info-value">
                    {jogoSelecionado.lancamento 
                      ? new Date(jogoSelecionado.lancamento).toLocaleDateString("pt-BR")
                      : "Não informado"}
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Preço</span>
                  <span className="modal-info-value">
                    {jogoSelecionado.preco ? `R$ ${jogoSelecionado.preco}` : "Grátis"}
                  </span>
                </div>
              </div>
              <p className="modal-descricao">{jogoSelecionado.descricao || "Sem descrição disponível."}</p>
              <div className="modal-botoes">
                <button className="modal-btn-play">▶ Jogar agora</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}