import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../services/fakeDatabase";
import { getFavoritos, getFavoritosCompletos } from "../services/favoritosLocalService";
import API from "../services/api";

export default function PerfilUsuario() {
  const { usuario, token, logout } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome || "Carlos");
  const [username, setUsername] = useState(usuario?.username || "carlos_gamer");
  const [bio, setBio] = useState(usuario?.bio || "Caçador de conquistas 🎮");
  const [avatar, setAvatar] = useState(usuario?.avatar || "");
  const [banner, setBanner] = useState(usuario?.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600");
  const [localizacao, setLocalizacao] = useState(usuario?.localizacao || "Brasil");
  const [steamLevel, setSteamLevel] = useState(usuario?.steamLevel || 15);
  const [xp, setXp] = useState(usuario?.xp || 1000);
  const [biblioteca, setBiblioteca] = useState([]);
  const [conquistas, setConquistas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativos, setAtivos] = useState("biblioteca");

  const conquistasEstaticas = [
    { id: 1, nome: "Shura", descricao: "Veja o final Shura", tipo: "ouro", desbloqueadoEm: "2025-02-15", jogo: "Sekiro", xp: 50 },
    { id: 2, nome: "Purificação", descricao: "Veja o final Purificação", tipo: "ouro", desbloqueadoEm: "2025-02-20", jogo: "Sekiro", xp: 50 },
    { id: 3, nome: "Retorno", descricao: "Veja o final Retorno", tipo: "ouro", desbloqueadoEm: "2025-02-25", jogo: "Sekiro", xp: 50 },
    { id: 4, nome: "Imortalidade Quebrada", descricao: "Derrote todos os chefes", tipo: "platina", desbloqueadoEm: "2025-03-01", jogo: "Sekiro", xp: 100 },
    { id: 5, nome: "Lobo Sagaz", descricao: "Domine todas as técnicas de shinobi", tipo: "prata", desbloqueadoEm: "2025-01-10", jogo: "Sekiro", xp: 30 },
    { id: 6, nome: "Mãos de Ferro", descricao: "Aprimore todos os braços shinobi", tipo: "prata", desbloqueadoEm: "2025-01-15", jogo: "Sekiro", xp: 30 },
    { id: 7, nome: "Altar da Restauração", descricao: "Colete 10 itens de cura", tipo: "bronze", desbloqueadoEm: "2024-12-01", jogo: "Sekiro", xp: 10 },
    { id: 8, nome: "Memórias de um Shinobi", descricao: "Derrote 5 chefes principais", tipo: "prata", desbloqueadoEm: "2025-01-20", jogo: "Sekiro", xp: 30 },
    { id: 9, nome: "Coração de Aço", descricao: "Complete o jogo sem morrer", tipo: "ouro", desbloqueadoEm: "2025-03-05", jogo: "Sekiro", xp: 50 },
    { id: 10, nome: "Tesouros do Templo", descricao: "Encontre todos os tesouros escondidos", tipo: "prata", desbloqueadoEm: "2025-02-10", jogo: "Sekiro", xp: 30 },
    { id: 11, nome: "Espada Imortal", descricao: "Desbloqueie a espada lendária", tipo: "ouro", desbloqueadoEm: "2025-02-28", jogo: "Sekiro", xp: 50 },
    { id: 12, nome: "Caminho do Guerreiro", descricao: "Complete todos os desafios dos templos", tipo: "prata", desbloqueadoEm: "2025-03-03", jogo: "Sekiro", xp: 30 },
    { id: 13, nome: "Fantasma da Ilha", descricao: "Complete o capítulo", tipo: "prata", desbloqueadoEm: "2025-03-10", jogo: "Ghost of Tsushima", xp: 30 },
    { id: 14, nome: "Mestre Lendário", descricao: "Aprenda todas as técnicas", tipo: "ouro", desbloqueadoEm: "2025-03-15", jogo: "Ghost of Tsushima", xp: 50 },
    { id: 15, nome: "Colecionador de Relíquias", descricao: "Encontre 20 relíquias", tipo: "prata", desbloqueadoEm: "2025-03-12", jogo: "Ghost of Tsushima", xp: 30 },
    { id: 16, nome: "Vingança Perfeita", descricao: "Derrote 10 inimigos sem ser detectado", tipo: "bronze", desbloqueadoEm: "2025-02-05", jogo: "Ghost of Tsushima", xp: 10 },
    { id: 17, nome: "Arte da Espada", descricao: "Domine todas as posturas", tipo: "prata", desbloqueadoEm: "2025-03-08", jogo: "Ghost of Tsushima", xp: 30 },
    { id: 18, nome: "Alma de Samurai", descricao: "Complete 50 missões", tipo: "ouro", desbloqueadoEm: "2025-03-18", jogo: "Ghost of Tsushima", xp: 50 },
    { id: 19, nome: "Pintura Viva", descricao: "Complete todos os haikus", tipo: "bronze", desbloqueadoEm: "2025-02-28", jogo: "Ghost of Tsushima", xp: 10 },
    { id: 20, nome: "Fantasma Lendário", descricao: "Posto máximo", tipo: "platina", desbloqueadoEm: "2025-03-20", jogo: "Ghost of Tsushima", xp: 100 }
  ];

  // Função para carregar os favoritos
  const carregarFavoritos = (bibliotecaData) => {
    const userKey = usuario?.matricula || usuario?.id || usuario?.email;
    if (!userKey) {
      console.log("Usuário sem identificador para favoritos");
      return;
    }
    
    console.log("Carregando favoritos para:", userKey);
    const favoritosSalvos = getFavoritos(userKey);
    console.log("Favoritos salvos (raw):", favoritosSalvos);
    
    // Extrair os jogos dos favoritos
    const jogosFavoritados = favoritosSalvos.map(fav => {
      // Se já tem os dados do jogo salvos
      if (fav.jogo) {
        return fav.jogo;
      }
      // Se não, tenta encontrar na biblioteca
      const jogoNaBiblioteca = bibliotecaData.find(j => j.id === (fav.jogoId || fav.id));
      return jogoNaBiblioteca || null;
    }).filter(jogo => jogo !== null);
    
    console.log("Jogos favoritados processados:", jogosFavoritados);
    setFavoritos(jogosFavoritados);
  };

  useEffect(() => {
    async function carregarDados() {
      if (!usuario?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API}/biblioteca/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let bibliotecaData = [];

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            bibliotecaData = data.map(jogo => {
              let conquistasCorretas = 0;
              let totalCorreto = 0;

              if (jogo.titulo === "Sekiro" || jogo.titulo === "Sekiro: Shadows Die Twice") {
                conquistasCorretas = 12;
                totalCorreto = 12;
              } else if (jogo.titulo === "Ghost of Tsushima") {
                conquistasCorretas = 8;
                totalCorreto = 8;
              }

              return {
                ...jogo,
                conquistas: conquistasCorretas,
                conquistasTotal: totalCorreto
              };
            });
          }
        }

        if (bibliotecaData.length === 0) {
          bibliotecaData = [
            {
              id: 1,
              titulo: "Sekiro: Shadows Die Twice",
              horasJogadas: 73,
              capaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
              ultimaVez: "2025-03-05",
              conquistas: 12,
              conquistasTotal: 12
            },
            {
              id: 2,
              titulo: "Ghost of Tsushima",
              horasJogadas: 45,
              capaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg",
              ultimaVez: "2025-03-20",
              conquistas: 8,
              conquistasTotal: 8
            }
          ];
        }

        setBiblioteca(bibliotecaData);
        carregarFavoritos(bibliotecaData);
        setConquistas(conquistasEstaticas);

      } catch (error) {
        console.error(error);
        const fallbackData = [
          {
            id: 1,
            titulo: "Sekiro: Shadows Die Twice",
            horasJogadas: 73,
            capaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg",
            ultimaVez: "2025-03-05",
            conquistas: 12,
            conquistasTotal: 12
          },
          {
            id: 2,
            titulo: "Ghost of Tsushima",
            horasJogadas: 45,
            capaUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg",
            ultimaVez: "2025-03-20",
            conquistas: 8,
            conquistasTotal: 8
          }
        ];
        setBiblioteca(fallbackData);
        carregarFavoritos(fallbackData);
        setConquistas(conquistasEstaticas);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [usuario, token]);

  // Escuta mudanças nos favoritos do localStorage
  useEffect(() => {
    function handleFavoritosUpdate() {
      console.log("Evento favoritosAtualizados recebido!");
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
  const totalReviews = 2;
  const totalFavoritos = favoritos.length;

  const conquistasSekiro = 12;
  const conquistasGhost = 8;
  const jogoFavorito = favoritos.length > 0 ? favoritos[0] : (biblioteca.length > 0 ? biblioteca[0] : null);
  const totalSekiro = 12;
  const totalGhost = 8;
  const metaProxima = 350;
  const proximoMarcoRestante = Math.max(0, metaProxima - totalConquistas);
  const progressoLenda = (totalConquistas / 500) * 100;

  function formatarData(data) {
    return data ? new Date(data).toLocaleDateString("pt-BR") : "Não informado";
  }

  function getMedalIcon(tipo) {
    if (tipo === 'platina') return '🏆';
    if (tipo === 'ouro') return '🥇';
    if (tipo === 'prata') return '🥈';
    return '🥉';
  }

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
    name: { fontSize: '2rem', color: 'white', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
    username: { fontSize: '0.9rem', color: '#8d99cf', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.8rem', borderRadius: '20px' },
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
    }
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
          let conquistasJogo = 0;
          let totalJogo = 0;

          if (jogo.titulo === "Sekiro" || jogo.titulo === "Sekiro: Shadows Die Twice") {
            conquistasJogo = 12;
            totalJogo = 12;
          } else if (jogo.titulo === "Ghost of Tsushima") {
            conquistasJogo = 8;
            totalJogo = 8;
          } else {
            conquistasJogo = jogo.conquistas || 0;
            totalJogo = jogo.conquistasTotal || 0;
          }

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
                  <div style={{ ...styles.progressFill, width: `100%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
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
              <div style={styles.name}>{nome}<span style={styles.username}>@{username}</span></div>
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
              <h2 style={styles.panelHeaderH2}>🏅 Conquistas & Marcos Eternos <small style={{ fontSize: '0.6rem', color: '#7a86b8' }}>últimos desbloqueios</small></h2>
            </div>
            <div style={styles.conquestList}>
              {conquistas.slice(0, 10).map((c) => (
                <div key={c.id} style={styles.conquestItem}>
                  <div style={styles.conquestLeft}>
                    <div style={styles.medalIcon}>{getMedalIcon(c.tipo)}</div>
                    <div>
                      <h4 style={styles.conquestInfoH4}>{c.nome} <span style={{ color: '#5f7eff', fontSize: '0.6rem' }}>({c.jogo})</span></h4>
                      <p style={styles.conquestInfoP}>{c.descricao}</p>
                    </div>
                  </div>
                  <div style={styles.conquestDate}>{formatarData(c.desbloqueadoEm)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={styles.progressCard}>
              <div style={styles.jogoConquistaRow}><strong>⚔️ Sekiro: Shadows Die Twice</strong><span style={{ color: '#e5e9ff' }}>{conquistasSekiro}/{totalSekiro} conquistas</span></div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `100%` }}></div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#8d99cf' }}>🎯 ✅ COMPLETO 100%</div>
            </div>

            <div style={styles.progressCard}>
              <div style={styles.jogoConquistaRow}><strong>🍃 Ghost of Tsushima</strong><span style={{ color: '#e5e9ff' }}>{conquistasGhost}/{totalGhost} conquistas</span></div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `100%` }}></div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#8d99cf' }}>🎯 ✅ COMPLETO 100%</div>
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
                    <span>{jogoFavorito.titulo === "Sekiro" || jogoFavorito.titulo === "Sekiro: Shadows Die Twice" ? "12/12" : "8/8"}</span>
                  </div>
                    <div style={{ ...styles.progressFill, width: `100%` }}></div>
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
        </div>

        <div>
          {loading ? (
            <div style={styles.emptyState}>Carregando dados...</div>
          ) : (
            <>
              {ativos === "biblioteca" && renderizarJogos(biblioteca, 'biblioteca')}
              
              {ativos === "favoritos" && renderizarJogos(favoritos, 'favoritos')}

              {ativos === "conquistas" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ ...styles.progressCard, marginBottom: '0.5rem' }}>
                    <h3 style={{ color: '#e5e9ff', marginBottom: '0.5rem' }}>⚔️ Sekiro: Shadows Die Twice (12/12)</h3>
                    {conquistas.filter(c => c.jogo === "Sekiro").map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#0d0f19', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #262c48', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>{getMedalIcon(c.tipo)}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'white', fontSize: '0.85rem' }}>{c.nome}</h4>
                          <p style={{ fontSize: '0.65rem', color: '#8d99cf' }}>{c.descricao}</p>
                        </div>
                        <small style={{ color: '#6e7cb3' }}>{formatarData(c.desbloqueadoEm)}</small>
                      </div>
                    ))}
                  </div>

                  <div style={styles.progressCard}>
                    <h3 style={{ color: '#e5e9ff', marginBottom: '0.5rem' }}>🍃 Ghost of Tsushima (8/8)</h3>
                    {conquistas.filter(c => c.jogo === "Ghost of Tsushima").map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#0d0f19', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #262c48', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>{getMedalIcon(c.tipo)}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'white', fontSize: '0.85rem' }}>{c.nome}</h4>
                          <p style={{ fontSize: '0.65rem', color: '#8d99cf' }}>{c.descricao}</p>
                        </div>
                        <small style={{ color: '#6e7cb3' }}>{formatarData(c.desbloqueadoEm)}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.actions}>
          {editando ? (
            <>
              <button onClick={() => { updateUser(usuario.id, { nome, bio, avatar }); setEditando(false); }} style={styles.btnSalvar}>
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