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
        
        // Buscar jogos filtrando pelo autorId = id do usuário logado
        const response = await fetch(`${API}/jogos?autorId=${usuario.id}`, {
          headers: {
            "token": `${token}`,
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
              console.log(`✅ Jogo do usuário: ${jogo.titulo} (ID: ${jogo.id})`);
            } else {
              console.log(`❌ Jogo ignorado: ${jogo.titulo} (autorId: ${jogo.autorId})`);
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
          
          setJogos(jogosDoUsuario);
          
          if (jogosDoUsuario.length > 0) {
            setJogoSelecionado(jogosDoUsuario[0]);
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
            Selecione um jogo na lista ao lado
          </div>
        )}
      </div>
    </div>
  );
}