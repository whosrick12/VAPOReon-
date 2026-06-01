import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser, getUserGames, getUsers } from "../services/fakeDatabase";
import API from "../services/api";
import "../CSS/perfilUsuario.css";

export default function PerfilUsuario() {
  const { usuario, token, logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome || "");
  const [bio, setBio] = useState(usuario?.bio || "");
  const [avatar, setAvatar] = useState(usuario?.avatar || "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  
  // Estados para os dados da API
  const [biblioteca, setBiblioteca] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [conquistas, setConquistas] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativos, setAtivos] = useState("biblioteca");

  // Buscar dados do usuário na API
  useEffect(() => {
    async function carregarDadosUsuario() {
      if (!usuario?.id) return;
      
      setLoading(true);
      
      try {
        // 1. Buscar biblioteca do usuário
        try {
          const res = await fetch(`${API}/biblioteca/me`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setBiblioteca(data);
          }
        } catch (e) {
          console.log("Erro ao carregar biblioteca, usando dados locais");
          const userGames = getUserGames(usuario.id);
          setBiblioteca(userGames);
        }
        
        // 2. Buscar wishlist
        try {
          const res = await fetch(`${API}/wishlist/me`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setWishlist(data);
          }
        } catch (e) {
          console.log("Erro ao carregar wishlist");
          setWishlist([]);
        }
        
        // 3. Buscar reviews do usuário
        try {
          const res = await fetch(`${API}/reviews?autorId=${usuario.id}`);
          if (res.ok) {
            const data = await res.json();
            setReviews(data.itens || []);
          }
        } catch (e) {
          console.log("Erro ao carregar reviews");
          setReviews([]);
        }
        
        // 4. Buscar conquistas do usuário
        try {
          const res = await fetch(`${API}/conquistas?usuarioId=${usuario.id}`);
          if (res.ok) {
            const data = await res.json();
            setConquistas(data.itens || []);
          }
        } catch (e) {
          console.log("Erro ao carregar conquistas");
          setConquistas([]);
        }
        
      } catch (error) {
        console.error("Erro geral:", error);
      } finally {
        setLoading(false);
      }
    }
    
    carregarDadosUsuario();
  }, [usuario, token]);

  function handleEditar() {
    setEditando(true);
  }

  function handleCancelar() {
    setNome(usuario.nome);
    setBio(usuario.bio || "");
    setAvatar(usuario.avatar);
    setEditando(false);
    setMensagem("");
    setErro("");
  }

  function handleSalvar() {
    try {
      const usuarioAtualizado = updateUser(usuario.id, {
        nome,
        bio,
        avatar
      });
      
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
      
      setMensagem("Perfil atualizado com sucesso!");
      setEditando(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      setErro(error.message);
    }
  }

  function formatarData(data) {
    if (!data) return "Não informado";
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR");
  }

  // Renderizar conteúdo da aba selecionada
  function renderConteudo() {
    if (loading) {
      return <div className="loading-spinner">Carregando dados...</div>;
    }
    
    switch(ativos) {
      case "biblioteca":
        return (
          <div className="biblioteca-grid">
            {biblioteca.length > 0 ? (
              biblioteca.map((jogo) => (
                <div key={jogo.id} className="biblioteca-item">
                  <img src={jogo.capaUrl} alt={jogo.titulo} />
                  <div className="biblioteca-info">
                    <h4>{jogo.titulo}</h4>
                    <p>{jogo.horasJogadas || 0} horas jogadas</p>
                    <span>Última vez: {formatarData(jogo.ultimaVez)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>📚 Sua biblioteca está vazia</p>
                <small>Compre jogos na loja para aparecerem aqui</small>
              </div>
            )}
          </div>
        );
        
      case "wishlist":
        return (
          <div className="wishlist-grid">
            {wishlist.length > 0 ? (
              wishlist.map((jogo) => (
                <div key={jogo.id} className="wishlist-item">
                  <img src={jogo.capaUrl} alt={jogo.titulo} />
                  <div className="wishlist-info">
                    <h4>{jogo.titulo}</h4>
                    <p>R$ {jogo.preco}</p>
                    <button className="btn-comprar">Comprar</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>❤️ Sua lista de desejos está vazia</p>
                <small>Adicione jogos que você quer comprar</small>
              </div>
            )}
          </div>
        );
        
      case "reviews":
        return (
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-rating">⭐ {review.nota || 5}/5</span>
                    <span className="review-date">{formatarData(review.createdAt)}</span>
                  </div>
                  <p>{review.comentario || "Sem comentário adicional."}</p>
                  <small>Jogo ID: {review.jogoId}</small>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>✍️ Você ainda não fez nenhuma review</p>
                <small>Compre e avalie jogos para aparecerem aqui</small>
              </div>
            )}
          </div>
        );
        
      case "conquistas":
        return (
          <div className="conquistas-grid">
            {conquistas.length > 0 ? (
              conquistas.map((conquista) => (
                <div key={conquista.id} className="conquista-item">
                  <div className="conquista-icon">🏆</div>
                  <div className="conquista-info">
                    <h4>{conquista.nome || "Conquista desbloqueada"}</h4>
                    <p>{conquista.descricao || "Parabéns! Você desbloqueou esta conquista."}</p>
                    <small>{formatarData(conquista.desbloqueadoEm)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>🎮 Nenhuma conquista desbloqueada ainda</p>
                <small>Jogue mais para desbloquear conquistas</small>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  }

  if (!usuario) {
    return (
      <div className="perfil-container">
        <div className="perfil-card">
          <p>Usuário não encontrado. Faça login novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        {/* HEADER DO PERFIL */}
        <div className="perfil-header">
          <div className="avatar-container">
            <img 
              src={usuario.avatar || `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(usuario.nome)}`} 
              alt={usuario.nome}
            />
            {editando && (
              <div className="avatar-edit">
                <input
                  type="text"
                  placeholder="URL do avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="perfil-title">
            {editando ? (
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="edit-nome"
              />
            ) : (
              <h1>{usuario.nome}</h1>
            )}
            <p className="member-since">Membro desde {formatarData(usuario.memberSince || usuario.createdAt)}</p>
          </div>
        </div>

        {/* BIO */}
        <div className="perfil-bio">
          <h3>Sobre mim</h3>
          {editando ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={4}
            />
          ) : (
            <p>{usuario.bio || "Nenhuma biografia adicionada ainda."}</p>
          )}
        </div>

        {/* ESTATÍSTICAS */}
        <div className="perfil-stats">
          <div className="stat-card">
            <span className="stat-value">{usuario.steamLevel || 1}</span>
            <span className="stat-label">Nível</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{biblioteca.length}</span>
            <span className="stat-label">Jogos na biblioteca</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{reviews.length}</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{conquistas.length}</span>
            <span className="stat-label">Conquistas</span>
          </div>
        </div>

        {/* TABS */}
        <div className="perfil-tabs">
          <button 
            className={ativos === "biblioteca" ? "tab-active" : "tab"}
            onClick={() => setAtivos("biblioteca")}
          >
            📚 Biblioteca
          </button>
          <button 
            className={ativos === "wishlist" ? "tab-active" : "tab"}
            onClick={() => setAtivos("wishlist")}
          >
            ❤️ Wishlist
          </button>
          <button 
            className={ativos === "reviews" ? "tab-active" : "tab"}
            onClick={() => setAtivos("reviews")}
          >
            ✍️ Reviews
          </button>
          <button 
            className={ativos === "conquistas" ? "tab-active" : "tab"}
            onClick={() => setAtivos("conquistas")}
          >
            🏆 Conquistas
          </button>
        </div>

        {/* CONTEÚDO DA ABA */}
        <div className="perfil-conteudo">
          {renderConteudo()}
        </div>

        {/* MENSAGENS */}
        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}

        {/* BOTÕES */}
        <div className="perfil-actions">
          {editando ? (
            <>
              <button onClick={handleSalvar} className="btn-salvar">Salvar</button>
              <button onClick={handleCancelar} className="btn-cancelar">Cancelar</button>
            </>
          ) : (
            <button onClick={handleEditar} className="btn-editar">Editar perfil</button>
          )}
          <button onClick={logout} className="btn-logout">Sair da conta</button>
        </div>
      </div>
    </div>
  );
}