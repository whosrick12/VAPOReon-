import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserGames } from "../services/fakeDatabase";
import { getFavoritos, addFavorito, removeFavorito } from "../services/favoritosLocalService";
import "../CSS/Biblioteca.css";

export default function Biblioteca() {
  const { usuario } = useAuth();

  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [favoritando, setFavoritando] = useState(false);

  function getConquistasPorJogo(titulo) {
    if (titulo === "Sekiro" || titulo === "Sekiro: Shadows Die Twice") {
      return 12;
    }
    if (titulo === "Ghost of Tsushima") {
      return 8;
    }
    return 0;
  }

  function getTotalConquistas(titulo) {
    if (titulo === "Sekiro" || titulo === "Sekiro: Shadows Die Twice") {
      return 12;
    }
    if (titulo === "Ghost of Tsushima") {
      return 8;
    }
    return 0;
  }

  useEffect(() => {
    function carregarBiblioteca() {
      if (!usuario) return;

      console.log("Usando biblioteca local");
      const jogosLocais = getUserGames(usuario.id);
      
      const jogosAtualizados = jogosLocais.map(jogo => ({
        ...jogo,
        conquistas: getConquistasPorJogo(jogo.titulo),
        totalConquistas: getTotalConquistas(jogo.titulo)
      }));

      setJogos(jogosAtualizados);
      if (jogosAtualizados.length > 0) {
        setJogoSelecionado(jogosAtualizados[0]);
      }
      setLoading(false);
    }

    function carregarFavoritos() {
      const userKey = usuario?.matricula || usuario?.id || usuario?.email;
      if (!userKey) {
        console.log("Usuário não tem identificador para favoritos");
        return;
      }
      console.log("Carregando favoritos para:", userKey);
      const favs = getFavoritos(userKey);
      console.log("Favoritos carregados:", favs);
      setFavoritos(favs.map(f => f.jogoId || f.id));
    }

    carregarBiblioteca();
    carregarFavoritos();
  }, [usuario]);

  async function handleFavorito(jogo, e) {
    e.stopPropagation();
    
    const userKey = usuario?.matricula || usuario?.id || usuario?.email;
    
    console.log("=== DEBUG FAVORITO ===");
    console.log("Usuário completo:", usuario);
    console.log("UserKey (identificador):", userKey);
    console.log("Jogo:", jogo);
    console.log("Jogo ID:", jogo.id);
    console.log("Favoritos atuais (IDs):", favoritos);
    
    if (!userKey) {
      console.error("Usuário não tem identificador (matricula/id/email)!");
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }
    
    setFavoritando(true);
    try {
      if (favoritos.includes(jogo.id)) {
        console.log("Removendo dos favoritos...");
        removeFavorito(userKey, jogo.id);
        setFavoritos(favoritos.filter(id => id !== jogo.id));
        console.log("Removido com sucesso!");
      } else {
        console.log("Adicionando aos favoritos...");
        addFavorito(userKey, jogo.id, jogo);
        setFavoritos([...favoritos, jogo.id]);
        console.log("Adicionado com sucesso!");
      }
      
      // Verificar se salvou no localStorage
      const saved = localStorage.getItem("favoritos_db");
      console.log("LocalStorage após operação:", saved);
      
      // DISPARAR EVENTO PARA ATUALIZAR A PÁGINA DE PERFIL
      window.dispatchEvent(new Event('favoritosAtualizados'));
      
    } catch (error) {
      console.error("Erro detalhado ao favoritar:", error);
      alert("Erro ao favoritar: " + error.message);
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
        Carregando biblioteca...
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-sidebar">
        <h2>Biblioteca</h2>
        <div className="library-total">
          {jogos.length} jogos
        </div>
        <input
          type="text"
          placeholder="Pesquisar..."
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
                <h3>{jogoSelecionado.conquistas || 0} / {jogoSelecionado.totalConquistas || getTotalConquistas(jogoSelecionado.titulo)}</h3>
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
            Nenhum jogo encontrado.
          </div>
        )}
      </div>
    </div>
  );
}