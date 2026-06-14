import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFavoritos } from "../services/favoritosLocalService";
import API from "../services/api";

export default function PerfilUsuario() {
  const { usuario, token, logout } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome || "Carlos");
  const [bio, setBio] = useState(usuario?.bio || "Caçador de conquistas 🎮");
  const [avatar, setAvatar] = useState(usuario?.avatar || "");
  const [banner, setBanner] = useState(usuario?.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600");
  const [localizacao, setLocalizacao] = useState(usuario?.localizacao || "Brasil");
  const [steamLevel, setSteamLevel] = useState(usuario?.steamLevel || 15);
  const [xp, setXp] = useState(usuario?.xp || 1000);
  const [biblioteca, setBiblioteca] = useState([]);
  const [conquistas, setConquistas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativos, setAtivos] = useState("biblioteca");
  const [loadingConquistas, setLoadingConquistas] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const carregarFavoritos = (bibliotecaData) => {
    const userKey = usuario?.matricula || usuario?.id || usuario?.email;
    if (!userKey) return;
    
    const favoritosSalvos = getFavoritos(userKey);
    const jogosFavoritados = favoritosSalvos.map(fav => {
      if (fav.jogo) return fav.jogo;
      const jogoNaBiblioteca = bibliotecaData.find(j => j.id === (fav.jogoId || fav.id));
      return jogoNaBiblioteca || null;
    }).filter(jogo => jogo !== null);
    
    setFavoritos(jogosFavoritados);
  };

  // Buscar conquistas da API
  const carregarConquistas = async () => {
    if (!usuario?.id) return;
    setLoadingConquistas(true);
    try {
      console.log("Buscando conquistas da API...");
      const response = await fetch(`${API}/conquistas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Conquistas recebidas da API:", data);
        
        let conquistasList = [];
        if (data.itens) conquistasList = data.itens;
        else if (data.conquistas) conquistasList = data.conquistas;
        else if (Array.isArray(data)) conquistasList = data;
        
        setConquistas(conquistasList);
      } else {
        console.log("Erro ao buscar conquistas:", response.status);
        setConquistas([]);
      }
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error);
      setConquistas([]);
    } finally {
      setLoadingConquistas(false);
    }
  };

  // Buscar reviews da API
  const carregarReviews = async () => {
    if (!usuario?.id) return;
    setLoadingReviews(true);
    try {
      console.log("Buscando reviews da API...");
      const response = await fetch(`${API}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Reviews recebidas da API:", data);
        
        let reviewsList = [];
        if (data.itens) reviewsList = data.itens;
        else if (data.reviews) reviewsList = data.reviews;
        else if (Array.isArray(data)) reviewsList = data;
        
        // Buscar informações dos jogos para cada review
        const reviewsComJogo = await Promise.all(
          reviewsList.map(async (review) => {
            try {
              const jogoRes = await fetch(`${API}/jogos/${review.jogoId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (jogoRes.ok) {
                const jogo = await jogoRes.json();
                return { ...review, jogo: jogo.titulo, jogoCapa: jogo.capaUrl };
              }
            } catch (e) {
              console.error(e);
            }
            return { ...review, jogo: "Jogo desconhecido" };
          })
        );
        
        setReviews(reviewsComJogo);
      } else {
        console.log("Erro ao buscar reviews:", response.status);
        setReviews([]);
      }
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    async function carregarDados() {
      if (!usuario?.id) return;
      setLoading(true);
      try {
        console.log("Token sendo usado:", token);
        
        if (!token) {
          console.log("Token não encontrado");
          setBiblioteca([]);
          carregarFavoritos([]);
          setLoading(false);
          return;
        }
        
        // Buscar jogos do usuário logado
        const res = await fetch(`${API}/jogos?autorId=${usuario.id}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Status da resposta /jogos?autorId:", res.status);

        let bibliotecaData = [];

        if (res.ok) {
          const data = await res.json();
          console.log("Jogos recebidos da API:", data);
          
          let jogosList = [];
          if (data.itens) jogosList = data.itens;
          else if (data.jogos) jogosList = data.jogos;
          else if (Array.isArray(data)) jogosList = data;
          
          // Filtrar apenas jogos do usuário logado
          const jogosDoUsuario = jogosList.filter(jogo => 
            jogo.autorId === usuario.id || 
            jogo.userId === usuario.id || 
            jogo.usuarioId === usuario.id ||
            jogo.criadorId === usuario.id
          );
          
          bibliotecaData = jogosDoUsuario.map(jogo => ({
            ...jogo,
            conquistas: 0,
            conquistasTotal: 0
          }));
        }

        setBiblioteca(bibliotecaData);
        carregarFavoritos(bibliotecaData);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setBiblioteca([]);
        carregarFavoritos([]);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [usuario, token]);

  useEffect(() => {
    if (!loading) {
      carregarConquistas();
      carregarReviews();
    }
  }, [loading]);

  useEffect(() => {
    function handleFavoritosUpdate() {
      if (biblioteca.length > 0) {
        carregarFavoritos(biblioteca);
      }
    }

    window.addEventListener('favoritosAtualizados', handleFavoritosUpdate);
    return () => {
      window.removeEventListener('favoritosAtualizados', handleFavoritosUpdate);
    };
  }, [biblioteca]);

  const horasTotais = biblioteca.reduce((acc, jogo) => acc + (jogo.horasJogadas || 0), 0);
  const totalJogos = biblioteca.length;
  const totalConquistas = conquistas.length;
  const totalReviews = reviews.length;
  const totalFavoritos = favoritos.length;

  const getConquistasPorJogo = (jogoId) => {
    return conquistas.filter(c => c.jogoId === jogoId || c.jogo?.id === jogoId).length;
  };

  const conquistasSekiro = getConquistasPorJogo(68);
  const conquistasGhost = getConquistasPorJogo(67);
  const totalSekiro = 12;
  const totalGhost = 8;
  
  const jogoFavorito = favoritos.length > 0 ? favoritos[0] : (biblioteca.length > 0 ? biblioteca[0] : null);
  
  const metaProxima = 350;
  const proximoMarcoRestante = Math.max(0, metaProxima - totalConquistas);
  const progressoLenda = (totalConquistas / 500) * 100;

  function formatarData(data) {
    return data ? new Date(data).toLocaleDateString("pt-BR") : "Não informado";
  }

  function getMedalIcon(tipo) {
    const tipoLower = (tipo || "").toLowerCase();
    if (tipoLower === 'platina' || tipoLower === 'platinum') return '🏆';
    if (tipoLower === 'ouro' || tipoLower === 'gold') return '🥇';
    if (tipoLower === 'prata' || tipoLower === 'silver') return '🥈';
    if (tipoLower === 'bronze') return '🥉';
    return '🎮';
  }

  const renderStars = (nota) => {
    const stars = [];
    const fullStars = Math.floor(nota);
    const hasHalfStar = nota % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars.push('⭐');
    if (hasHalfStar) stars.push('½');
    for (let i = stars.length; i < 5; i++) stars.push('☆');
    
    return stars.join('');
  };

  const updateUserLocal = async (userId, data) => {
    console.log("Atualizando usuário:", userId, data);
    setNome(data.nome || nome);
    setBio(data.bio || bio);
    setAvatar(data.avatar || avatar);
  };

  if (!usuario) {
    return <div style={{ background: '#0a0c15', color: 'white', padding: '2rem' }}>Usuário não encontrado</div>;
  }

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0c15 0%, #0f111a 100%)', fontFamily: 'Segoe UI, system-ui, sans-serif' },
    hero: { position: 'relative', width: '100%', height: '340px', overflow: 'hidden' },
    heroBanner: { width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, #0a0c15 0%, rgba(10,12,21,0.8) 60%, transparent 100%)', padding: '0 5% 1.5rem 5%' },
    heroContent: { display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' },
    avatarWrapper: { position: 'relative' },
    avatar: { width: '140px', height: '140px', borderRadius: '50%', border: '4px solid #1a6eff', objectFit: 'cover', background: '#1a1f2e' },
    avatarFrame: { position: 'absolute', bottom: '5px', right: '5px', background: '#1a6eff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', color: 'white', border: '2px solid #0a0c15' },
    heroInfo: { flex: 1, marginBottom: '0.5rem' },
    name: { fontSize: '2rem', color: 'white', marginBottom: '0.25rem' },
    userStatus: { display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' },
    statusOnline: { background: '#2ecc71', width: '10px', height: '10px', borderRadius: '50%', boxShadow: '0 0 5px #2ecc71' },
    badgeLevel: { background: 'linear-gradient(135deg, #2c3e50, #1a1f2e)', padding: '0.25rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, color: '#b0b8e0' },
    badgeXp: { background: '#8e44ad', padding: '0.25rem 0.8rem', borderRadius: '20px', fontSize: '0.65rem', color: 'white' },
    infoRow: { display: 'flex', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' },
    infoChip: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#b0b8e0', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.8rem', borderRadius: '20px' },
    badgesRow: { marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' },
    badgeItem: { background: 'rgba(26,30,50,0.9)', borderRadius: '20px', padding: '0.2rem 0.7rem', fontSize: '0.65rem', border: '1px solid #3a4070', color: '#b0b8e0' },
    badgeGold: { borderColor: '#f1c40f', color: '#f1c40f' },
    main: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
    statsRow: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
    statCard: { background: 'rgba(18,22,40,0.7)', borderRadius: '16px', padding: '1rem 1.5rem', flex: 1, minWidth: '120px', textAlign: 'center', border: '1px solid #2a2f4b' },
    statNumber: { fontSize: '2rem', fontWeight: 800, color: '#e5e9ff', display: 'block' },
    statLabel: { fontSize: '0.7rem', color: '#8d99cf', textTransform: 'uppercase' },
    grid2col: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' },
    conquestPanel: { background: '#0d0f19', borderRadius: '20px', border: '1px solid #262c48', overflow: 'hidden' },
    panelHeader: { padding: '1rem', background: '#0b0e18', borderBottom: '1px solid #262c48' },
    panelHeaderH2: { fontSize: '1.1rem', color: '#eef2ff' },
    conquestList: { padding: '0.3rem 0', maxHeight: '400px', overflowY: 'auto' },
    conquestItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', borderBottom: '1px solid #1a1f30' },
    conquestLeft: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
    medalIcon: { fontSize: '1.6rem' },
    conquestInfoH4: { fontSize: '0.85rem', color: 'white' },
    conquestInfoP: { fontSize: '0.65rem', color: '#8d99cf' },
    conquestDate: { fontSize: '0.65rem', color: '#6e7cb3', background: '#161c2d', padding: '0.2rem 0.6rem', borderRadius: '20px' },
    progressCard: { background: '#0d0f19', borderRadius: '16px', padding: '1rem', border: '1px solid #262c48', marginBottom: '1rem' },
    progressBar: { background: '#1f253e', borderRadius: '30px', height: '8px', overflow: 'hidden' },
    progressFill: { background: 'linear-gradient(90deg, #b57cff, #5f7eff)', height: '100%', borderRadius: '30px' },
    globalMilestone: { background: '#0f1220', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2c3153', marginBottom: '1rem' },
    percentageBig: { fontSize: '1.5rem', fontWeight: 800, color: '#a9b6ff' },
    tabs: { display: 'flex', gap: '0.3rem', margin: '1.5rem 0 1rem', borderBottom: '1px solid #262c48' },
    tabBtn: { background: 'none', border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 600, color: '#8d99cf', cursor: 'pointer' },
    tabActive: { color: 'white', borderBottom: '2px solid #5f7eff' },
    bibliotecaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
    bibliotecaItem: { background: '#0d0f19', borderRadius: '12px', overflow: 'hidden', border: '1px solid #262c48', position: 'relative' },
    bibliotecaImg: { width: '100%', height: '120px', objectFit: 'cover' },
    bibliotecaInfo: { padding: '0.8rem' },
    bibliotecaH4: { fontSize: '0.85rem', color: 'white', marginBottom: '0.3rem' },
    bibliotecaP: { fontSize: '0.65rem', color: '#8d99cf' },
    conquistaProgresso: { marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #262c48' },
    emptyState: { textAlign: 'center', padding: '2rem', color: '#6e7cb3' },
    actions: { display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #262c48' },
    btnEditar: { background: '#2e3560', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.8rem' },
    btnSalvar: { background: '#10b981', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.8rem' },
    btnCancelar: { background: '#4b5563', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.8rem' },
    btnLogout: { background: '#dc2626', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.8rem' },
    textarea: { width: '100%', background: '#1a1f30', border: '1px solid #2a2f4b', color: 'white', padding: '0.5rem', borderRadius: '8px', marginTop: '0.3rem' },
    jogoConquistaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    favoritoBadge: { 
      position: 'absolute', 
      top: '8px', 
      right: '8px', 
      background: 'rgba(255, 0, 0, 0.8)',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem'
    },
    reviewCard: { background: '#0d0f19', borderRadius: '12px', padding: '1rem', border: '1px solid #262c48', marginBottom: '1rem' },
    reviewHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' },
    reviewJogoImg: { width: '50px', height: '70px', objectFit: 'cover', borderRadius: '8px' },
    reviewJogoNome: { fontSize: '0.9rem', fontWeight: 600, color: 'white' },
    reviewStars: { fontSize: '0.8rem', marginTop: '0.2rem' },
    reviewComentario: { fontSize: '0.8rem', color: '#b0b8e0', lineHeight: 1.5, marginBottom: '0.5rem' },
    reviewData: { fontSize: '0.65rem', color: '#6e7cb3' }
  };

  const renderizarJogos = (jogosParaRenderizar, tipo = 'biblioteca') => {
    if (jogosParaRenderizar.length === 0) {
      return (
        <div style={styles.emptyState}>
          {tipo === 'favoritos' ? (
            <>
              <p>🌟 Nenhum jogo favoritado ainda</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Vá até a Biblioteca e clique em ❤️ Favoritar nos seus jogos preferidos!
              </p>
            </>
          ) : (
            <p>📚 Nenhum jogo na biblioteca</p>
          )}
        </div>
      );
    }

    return (
      <div style={styles.bibliotecaGrid}>
        {jogosParaRenderizar.map(jogo => {
          const conquistasJogo = getConquistasPorJogo(jogo.id);
          const totalJogo = jogo.conquistasTotal || (jogo.titulo === "Sekiro" || jogo.titulo === "Sekiro: Shadows Die Twice" ? 12 : 8);

          return (
            <div key={jogo.id} style={styles.bibliotecaItem}>
              <img 
                style={styles.bibliotecaImg} 
                src={jogo.capaUrl} 
                alt={jogo.titulo} 
                onError={(e) => { e.target.src = "https://placehold.co/400x200/1a1f2e/white?text=Sem+Imagem"; }} 
              />
              {tipo === 'favoritos' && (
                <div style={styles.favoritoBadge}>❤️</div>
              )}
              <div style={styles.bibliotecaInfo}>
                <h4 style={styles.bibliotecaH4}>{jogo.titulo}</h4>
                <p style={styles.bibliotecaP}>{jogo.horasJogadas || 0} horas jogadas</p>
                <p style={styles.bibliotecaP}>🏆 {conquistasJogo}/{totalJogo} conquistas</p>
                <div style={{ ...styles.progressBar, marginTop: '0.5rem' }}>
                  <div style={{ ...styles.progressFill, width: totalJogo > 0 ? (conquistasJogo / totalJogo) * 100 : 0 }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderizarReviews = () => {
    if (loadingReviews) {
      return <div style={styles.emptyState}>Carregando reviews...</div>;
    }
    
    if (reviews.length === 0) {
      return (
        <div style={styles.emptyState}>
          📝 NENHUMA REVIEW AINDA
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#6e7cb3' }}>
            Avalie os jogos que você jogou e compartilhe sua opinião!
          </p>
        </div>
      );
    }

    return (
      <div>
        {reviews.map((review) => (
          <div key={review.id} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              {review.jogoCapa && (
                <img src={review.jogoCapa} alt={review.jogo} style={styles.reviewJogoImg} />
              )}
              <div>
                <h4 style={styles.reviewJogoNome}>{review.jogo}</h4>
                <div style={styles.reviewStars}>{renderStars(review.nota || review.rating || 0)}</div>
              </div>
            </div>
            <p style={styles.reviewComentario}>{review.comentario || review.descricao || "Sem comentário"}</p>
            <div style={styles.reviewData}>
              {formatarData(review.createdAt || review.data)}
            </div>
          </div>
        ))}
      </div>
    );
  };
    return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <img style={styles.heroBanner} src={banner} alt="banner" />
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.avatarWrapper}>
              <img style={styles.avatar} src={avatar || `https://ui-avatars.com/api/?background=1a6eff&color=fff&size=128&name=${encodeURIComponent(nome)}`} alt="avatar" />
              <div style={styles.avatarFrame} onClick={() => { const newUrl = prompt("URL do avatar:", avatar); if (newUrl) setAvatar(newUrl); }}>✎</div>
            </div>
            <div style={styles.heroInfo}>
              <div style={styles.name}>{nome}</div>
              <div style={styles.userStatus}>
                <div style={styles.statusOnline}></div>
                <span>Online</span>
                <span style={styles.badgeLevel}>🎮 Nível {steamLevel}</span>
                <span style={styles.badgeXp}>⭐ {xp} XP</span>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoChip}>📍 {localizacao}</div>
                <div style={styles.infoChip}>📅 Membro desde {formatarData(usuario.createdAt)}</div>
                <div style={styles.infoChip}>🏆 {totalConquistas} Conquistas</div>
                <div style={styles.infoChip}>❤️ {totalFavoritos} Favoritos</div>
              </div>
              <div style={styles.badgesRow}>
                <div style={styles.badgeItem}>🏆 Mestre das Conquistas</div>
                <div style={{ ...styles.badgeItem, ...styles.badgeGold }}>💎 {totalConquistas} Conquistas</div>
                <div style={styles.badgeItem}>⚡ Caçador de Platina</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.statsRow}>
          <div style={styles.statCard}><span style={styles.statNumber}>{horasTotais}</span><span style={styles.statLabel}>Horas Jogadas</span></div>
          <div style={styles.statCard}><span style={styles.statNumber}>{totalJogos}</span><span style={styles.statLabel}>Jogos</span></div>
          <div style={styles.statCard}><span style={styles.statNumber}>{totalReviews}</span><span style={styles.statLabel}>Reviews</span></div>
          <div style={styles.statCard}><span style={styles.statNumber}>{totalConquistas}</span><span style={styles.statLabel}>Conquistas</span></div>
          <div style={styles.statCard}><span style={styles.statNumber}>{totalFavoritos}</span><span style={styles.statLabel}>Favoritos</span></div>
        </div>

        <div style={styles.grid2col}>
          <div style={styles.conquestPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelHeaderH2}>🏅 Conquistas Recentes</h2>
            </div>
            <div style={styles.conquestList}>
              {loadingConquistas ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6e7cb3' }}>
                  Carregando conquistas...
                </div>
              ) : conquistas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6e7cb3' }}>
                  🎮 AINDA NENHUMA CONQUISTA
                </div>
              ) : (
                conquistas.slice(0, 10).map((c) => (
                  <div key={c.id} style={styles.conquestItem}>
                    <div style={styles.conquestLeft}>
                      <div style={styles.medalIcon}>{getMedalIcon(c.tipo)}</div>
                      <div>
                        <h4 style={styles.conquestInfoH4}>{c.nome} <span style={{ color: '#5f7eff', fontSize: '0.6rem' }}>({c.jogo})</span></h4>
                        <p style={styles.conquestInfoP}>{c.descricao}</p>
                      </div>
                    </div>
                    <div style={styles.conquestDate}>{formatarData(c.desbloqueadoEm || c.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div style={styles.progressCard}>
              <div style={styles.jogoConquistaRow}><strong>⚔️ Sekiro: Shadows Die Twice</strong><span style={{ color: '#e5e9ff' }}>{conquistasSekiro}/{totalSekiro} conquistas</span></div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: totalSekiro > 0 ? (conquistasSekiro / totalSekiro) * 100 : 0 }}></div>
              </div>
            </div>

            <div style={styles.progressCard}>
              <div style={styles.jogoConquistaRow}><strong>🍃 Ghost of Tsushima</strong><span style={{ color: '#e5e9ff' }}>{conquistasGhost}/{totalGhost} conquistas</span></div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: totalGhost > 0 ? (conquistasGhost / totalGhost) * 100 : 0 }}></div>
              </div>
            </div>

            <div style={styles.globalMilestone}>
              <div>
                <strong>📌 Próximo marco</strong>
                <div style={{ fontSize: '0.7rem' }}>350 conquistas (+{proximoMarcoRestante})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem' }}>Progresso para Lenda Prateada</div>
                <div style={styles.percentageBig}>{progressoLenda.toFixed(1)}%</div>
                <div style={{ fontSize: '0.6rem', color: '#8f9ad0' }}>meta: 500 conquistas</div>
              </div>
            </div>

            {jogoFavorito && (
              <div style={styles.progressCard}>
                <h3 style={{ marginBottom: '0.6rem', fontSize: '0.9rem', color: 'white' }}>⭐ Jogo Favorito</h3>
                {jogoFavorito.capaUrl && <img src={jogoFavorito.capaUrl} alt={jogoFavorito.titulo} style={{ width: '100%', borderRadius: '12px', marginBottom: '0.5rem', maxHeight: '120px', objectFit: 'cover' }} />}
                <h4 style={{ color: 'white', fontSize: '1rem' }}>{jogoFavorito.titulo}</h4>
                <p style={{ color: '#8d99cf', fontSize: '0.7rem' }}>{jogoFavorito.horasJogadas || 0} horas jogadas</p>
                <div style={styles.conquistaProgresso}>
                  <div style={styles.jogoConquistaRow}>
                    <span>🏆 Conquistas</span>
                    <span>{jogoFavorito.titulo === "Sekiro" || jogoFavorito.titulo === "Sekiro: Shadows Die Twice" ? `${conquistasSekiro}/${totalSekiro}` : `${conquistasGhost}/${totalGhost}`}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: jogoFavorito.titulo === "Sekiro" || jogoFavorito.titulo === "Sekiro: Shadows Die Twice" ? (conquistasSekiro / totalSekiro) * 100 : (conquistasGhost / totalGhost) * 100 }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.progressCard}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'white' }}>Sobre Mim</h3>
          {editando ? (
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows={3} 
              style={styles.textarea} 
            />
          ) : (
            <p style={{ marginTop: '0.3rem', color: '#a0a8d0', fontSize: '0.8rem' }}>
              {bio || "Nenhuma biografia adicionada."}
            </p>
          )}
        </div>

        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tabBtn, ...(ativos === "biblioteca" ? styles.tabActive : {}) }} 
            onClick={() => setAtivos("biblioteca")}
          >
            📚 Biblioteca ({biblioteca.length})
          </button>
          <button 
            style={{ ...styles.tabBtn, ...(ativos === "favoritos" ? styles.tabActive : {}) }} 
            onClick={() => setAtivos("favoritos")}
          >
            ❤️ Favoritos ({favoritos.length})
          </button>
          <button 
            style={{ ...styles.tabBtn, ...(ativos === "conquistas" ? styles.tabActive : {}) }} 
            onClick={() => setAtivos("conquistas")}
          >
            🏆 Conquistas ({conquistas.length})
          </button>
          <button 
            style={{ ...styles.tabBtn, ...(ativos === "reviews" ? styles.tabActive : {}) }} 
            onClick={() => setAtivos("reviews")}
          >
            📝 Reviews ({reviews.length})
          </button>
        </div>

        <div>
          {loading ? (
            <div style={styles.emptyState}>Carregando dados...</div>
          ) : (
            <>
              {ativos === "biblioteca" && renderizarJogos(biblioteca, 'biblioteca')}
              
              {ativos === "favoritos" && renderizarJogos(favoritos, 'favoritos')}

              {ativos === "conquistas" && (
                loadingConquistas ? (
                  <div style={styles.emptyState}>Carregando conquistas...</div>
                ) : conquistas.length === 0 ? (
                  <div style={styles.emptyState}>
                    🎮 NENHUMA CONQUISTA AINDA
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#6e7cb3' }}>
                      Complete desafios nos jogos para desbloquear conquistas!
                    </p>
                  </div>
                ) : (
                  <div>
                    {conquistas.map((c) => (
                      <div key={c.id} style={styles.conquestItem}>
                        <div style={styles.conquestLeft}>
                          <div style={styles.medalIcon}>{getMedalIcon(c.tipo)}</div>
                          <div>
                            <h4 style={styles.conquestInfoH4}>{c.nome} <span style={{ color: '#5f7eff', fontSize: '0.6rem' }}>({c.jogo})</span></h4>
                            <p style={styles.conquestInfoP}>{c.descricao}</p>
                          </div>
                        </div>
                        <div style={styles.conquestDate}>{formatarData(c.desbloqueadoEm || c.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {ativos === "reviews" && renderizarReviews()}
            </>
          )}
        </div>

        <div style={styles.actions}>
          {editando ? (
            <>
              <button onClick={() => { updateUserLocal(usuario.id, { nome, bio, avatar }); setEditando(false); }} style={styles.btnSalvar}>
                Salvar
              </button>
              <button onClick={() => { setNome(usuario.nome); setBio(usuario.bio || ""); setEditando(false); }} style={styles.btnCancelar}>
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)} style={styles.btnEditar}>
              Editar Perfil
            </button>
          )}
          <button onClick={logout} style={styles.btnLogout}>
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}