import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFavoritos, addFavorito, removeFavorito } from "../services/favoritosLocalService";
import API from "../services/api";
import "../CSS/Biblioteca.css";

export default function Biblioteca() {
  const { usuario, token } = useAuth();

  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [favoritando, setFavoritando] = useState(false);

  // Buscar conquistas de um jogo específico na API
  const buscarConquistasDoJogo = async (jogoId) => {
    try {
      console.log(`Buscando conquistas do jogo ${jogoId} na API...`);
      const response = await fetch(`${API}/conquistas?jogoId=${jogoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Conquistas do jogo ${jogoId} (API):`, data);
        
        let conquistasList = [];
        if (data.itens) conquistasList = data.itens;
        else if (data.conquistas) conquistasList = data.conquistas;
        else if (Array.isArray(data)) conquistasList = data;
        
        return {
          conquistas: conquistasList.length,
          totalConquistas: conquistasList.length,
          conquistasDetalhes: conquistasList
        };
      } else {
        console.log(`API sem conquistas para o jogo ${jogoId}`);
        return { conquistas: 0, totalConquistas: 0, conquistasDetalhes: [] };
      }
    } catch (error) {
      console.error(`Erro ao buscar conquistas do jogo ${jogoId}:`, error);
      return { conquistas: 0, totalConquistas: 0, conquistasDetalhes: [] };
    }
  };

  // Buscar apenas os jogos do usuário logado
  useEffect(() => {
    async function carregarBiblioteca() {
      if (!usuario?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        console.log("=== BUSCANDO APENAS JOGOS DO USUÁRIO LOGADO ===");
        console.log("Usuário ID:", usuario.id);
        console.log("Usuário matricula:", usuario.matricula);
        
        // Buscar jogos filtrando pelo autorId = id do usuário logado
        const response = await fetch(`${API}/jogos?autorId=${usuario.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Status resposta /jogos?autorId:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Dados brutos da API:", data);
          
          let jogosList = [];
          if (data.itens) jogosList = data.itens;
          else if (data.jogos) jogosList = data.jogos;
          else if (Array.isArray(data)) jogosList = data;
          
          console.log("Total de jogos retornados pela API:", jogosList.length);
          
          // FILTRO: Garantir que só os jogos do usuário logado aparecem
          const jogosDoUsuario = jogosList.filter(jogo => {
            const isAutor = jogo.autorId === usuario.id || 
                           jogo.autorId === usuario.matricula ||
                           jogo.userId === usuario.id ||
                           jogo.usuarioId === usuario.id ||
                           jogo.criadorId === usuario.id;
            
            if (isAutor) {
              console.log(`✅ Jogo do usuário: ${jogo.titulo} (ID: ${jogo.id}, autorId: ${jogo.autorId})`);
            } else {
              console.log(`❌ Jogo ignorado (não é do usuário): ${jogo.titulo} (autorId: ${jogo.autorId})`);
            }
            
            return isAutor;
          });
          
          console.log(`Jogos do usuário ${usuario.id}: ${jogosDoUsuario.length}`);
          
          if (jogosDoUsuario.length === 0) {
            console.log("Nenhum jogo encontrado para este usuário");
            setJogos([]);
            setLoading(false);
            return;
          }
          
          // Buscar conquistas para cada jogo do usuário
          const jogosComConquistas = await Promise.all(
            jogosDoUsuario.map(async (jogo) => {
              const conquistasInfo = await buscarConquistasDoJogo(jogo.id);
              return {
                ...jogo,
                conquistas: conquistasInfo.conquistas,
                totalConquistas: conquistasInfo.totalConquistas,
                conquistasDetalhes: conquistasInfo.conquistasDetalhes
              };
            })
          );
          
          console.log("Jogos finais do usuário:", jogosComConquistas.map(j => j.titulo));
          setJogos(jogosComConquistas);
          
          if (jogosComConquistas.length > 0) {
            setJogoSelecionado(jogosComConquistas[0]);
          }
        } else {
          console.error("Erro ao buscar jogos:", response.status);
          setJogos([]);
        }
        
      } catch (error) {
        console.error("Erro ao carregar biblioteca:", error);
        setJogos([]);
      } finally {
        setLoading(false);
      }
    }

    function carregarFavoritos() {
      const userKey = usuario?.matricula || usuario?.id || usuario?.email;
      if (!userKey) return;
      
      const favs = getFavoritos(userKey);
      setFavoritos(favs.map(f => f.jogoId || f.id));
    }

    carregarBiblioteca();
    carregarFavoritos();
  }, [usuario, token]);

  async function handleFavorito(jogo, e) {
    e.stopPropagation();
    
    const userKey = usuario?.matricula || usuario?.id || usuario?.email;
    
    if (!userKey) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }
    
    setFavoritando(true);
    try {
      if (favoritos.includes(jogo.id)) {
        removeFavorito(userKey, jogo.id);
        setFavoritos(favoritos.filter(id => id !== jogo.id));
      } else {
        addFavorito(userKey, jogo.id, jogo);
        setFavoritos([...favoritos, jogo.id]);
      }
      
      window.dispatchEvent(new Event('favoritosAtualizados'));
      
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    } finally {
      setFavoritando(false);
    }
  }

  const jogosFiltrados = jogos.filter((jogo) =>
    jogo.titulo?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className="library-loading">
        Carregando sua biblioteca...
      </div>
    );
  }

  if (jogos.length === 0) {
    return (
      <div className="library-empty">
        <h2>📚 Sua biblioteca está vazia</h2>
        <p>Você ainda não criou nenhum jogo.</p>
        <p>Vá em "Criar Jogo" e adicione seu primeiro jogo!</p>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-sidebar">
        <h2>Minha Biblioteca</h2>
        <div className="library-total">
          {jogos.length} jogos criados por você
        </div>
        <input
          type="text"
          placeholder="Pesquisar seus jogos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="library-search"
        />
        <div className="library-list">
          {jogosFiltrados.map((jogo) => (
            <div
              key={jogo.id}
              className={`library-game ${
                jogoSelecionado?.id === jogo.id ? "active" : ""
              }`}
              onClick={() => setJogoSelecionado(jogo)}
            >
              <img src={jogo.capaUrl} alt={jogo.titulo} />
              <div>
                <h4>{jogo.titulo}</h4>
                <span>{jogo.horasJogadas || 0} horas</span>
                <div className="conquistas-info">
                  🏆 {jogo.conquistas || 0}/{jogo.totalConquistas || 0} conquistas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="library-content">
        {jogoSelecionado ? (
          <>
            <div
              className="library-banner"
              style={{
                backgroundImage: `url(${jogoSelecionado.capaUrl})`,
              }}
            >
              <div className="library-overlay">
                <h1>{jogoSelecionado.titulo}</h1>
                <p>{jogoSelecionado.descricao || "Sem descrição disponível."}</p>
                <div className="botoes-container">
                  <button className="btn-play">▶ Jogar</button>
                  <button 
                    className={`btn-favorito ${favoritos.includes(jogoSelecionado.id) ? "favorito-ativo" : ""}`}
                    onClick={(e) => handleFavorito(jogoSelecionado, e)}
                    disabled={favoritando}
                  >
                    {favoritos.includes(jogoSelecionado.id) ? "❤️ Favoritado" : "🤍 Favoritar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="library-stats">
              <div className="stat-box">
                <h3>{jogoSelecionado.horasJogadas || 0}</h3>
                <span>Horas jogadas</span>
              </div>
              <div className="stat-box">
                <h3>{jogoSelecionado.conquistas || 0} / {jogoSelecionado.totalConquistas || 0}</h3>
                <span>Conquistas</span>
              </div>
              <div className="stat-box">
                <h3>{jogoSelecionado.ultimaVez
                    ? new Date(jogoSelecionado.ultimaVez).toLocaleDateString("pt-BR")
                    : "Nunca"}
                </h3>
                <span>Última sessão</span>
              </div>
            </div>

            <div className="library-about">
              <h2>Sobre este jogo</h2>
              <p>{jogoSelecionado.sinopse || jogoSelecionado.descricao}</p>
            </div>

            {/* Seção de Conquistas do jogo */}
            <div className="library-conquistas">
              <h2>🏆 Conquistas do Jogo</h2>
              {jogoSelecionado.conquistasDetalhes && jogoSelecionado.conquistasDetalhes.length > 0 ? (
                <div className="conquistas-grid">
                  {jogoSelecionado.conquistasDetalhes.map((conquista, index) => (
                    <div key={index} className="conquista-card">
                      <div className="conquista-icon">
                        {conquista.tipo === "ouro" ? "🥇" : conquista.tipo === "prata" ? "🥈" : conquista.tipo === "bronze" ? "🥉" : "🏅"}
                      </div>
                      <div className="conquista-info">
                        <h4>{conquista.nome}</h4>
                        <p>{conquista.descricao}</p>
                        <span className="conquista-tipo">{conquista.tipo || "Conquista"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="nenhuma-conquista">
                  <p></p>
                  <p className="conquista-hint"></p>
                </div>
              )}
            </div>

            <div className="library-gallery">
              <h2>Capturas de tela</h2>
              <div className="gallery-grid">
                {jogoSelecionado.imagens?.length > 0 ? (
                  jogoSelecionado.imagens.map((img, index) => (
                    <img key={index} src={img.url} alt="" />
                  ))
                ) : (
                  <img src={jogoSelecionado.capaUrl} alt="" />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="library-empty">
            Selecione um jogo na lista ao lado
          </div>
        )}
      </div>
    </div>
  );
}