import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import "../CSS/DetalhesJogo.css";

export default function DetalheJogo({ jogos }) {
  const { id } = useParams();
  const { token, usuario } = useAuth();

  const jogo = jogos.find(j => String(j.id) === id);

  const [midiaIndex, setMidiaIndex] = useState(0);
  const [desenvolvedor, setDesenvolvedor] = useState("");
  const [generoPrincipal, setGeneroPrincipal] = useState("");
  const [dataLancamento, setDataLancamento] = useState("");
  const [modoJogo, setModoJogo] = useState("");
  
  const [reviewNota, setReviewNota] = useState(5);
  const [reviewTexto, setReviewTexto] = useState("");
  const [reviewRecomenda, setReviewRecomenda] = useState(true);
  const [enviandoReview, setEnviandoReview] = useState(false);
  const [mensagemReview, setMensagemReview] = useState("");
  const [reviewExistente, setReviewExistente] = useState(null);
  const [carregandoReview, setCarregandoReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [carregandoReviews, setCarregandoReviews] = useState(false);
  
  const [naBiblioteca, setNaBiblioteca] = useState(false);
  const [adicionandoBiblioteca, setAdicionandoBiblioteca] = useState(false);
  const [mensagemBiblioteca, setMensagemBiblioteca] = useState("");

  // Lista de imagens de fallback (jogos REAIS hospedados no Cloudinary)
  const imagensFallback = [
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580834/thelast_zxvx3i.jpg",      // The Last of Us
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580834/Black-Myth-Wukong_tgp8tn.jpg", // Black Myth: Wukong
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580833/dark-souls-remastered_pn596o.jpg", // Dark Souls
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580829/re4_arplj8.png",           // Resident Evil 4
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580831/days-gone-zombie-strike-poster-808vz2axmhw4zege_sqmwjr.jpg", // Days Gone
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580830/godw_utrvkr.png",         // God of War
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580829/elden_q1u1ki.jpg",         // Elden Ring
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580826/20221117-ovicio-red-dead-capa_tmlbiw.webp", // Red Dead Redemption
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/3a713d5c-b4cb-4672-acbd-5a1fdfac79d8_zq4zab.jpg", // Alternativa
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/gowR_ddobbo.webp",        // God of War Ragnarök
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580825/fundo-de-dying-light-869t85ft652ly3jc_ravpum.jpg", // Dying Light
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580825/F077DBEWIAYzW5L.jpg_mdmwfh.webp", // EA Sports FC
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580266/re4_igldoy.png",           // RE4 alternativo
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/a5h4887tvu4b1_oewrjg.jpg", // Alternativa
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580832/20230314-ovicio-outlast-2-capa_g3jhbo.webp" // Outlast 2
  ];

  // Função para pegar imagem de fallback baseada no ID do jogo
  const getFallbackImage = (jogoId) => {
    if (!jogoId) return imagensFallback[0];
    const index = (jogoId % imagensFallback.length);
    return imagensFallback[index];
  };

  // Função para tratar erro de imagem da capa
  const handleImageError = (e, jogoId) => {
    const fallbackUrl = getFallbackImage(jogoId);
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  };

  // Função para tratar erro de imagem das miniaturas
  const handleThumbError = (e, jogoId, index) => {
    const fallbackUrl = getFallbackImage(jogoId + index);
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  };

  function formatarAno(dataString) {
    if (!dataString) return "Em breve";
    if (/^\d{4}$/.test(dataString)) return dataString;
    const data = new Date(dataString);
    if (!isNaN(data.getTime())) return data.getFullYear().toString();
    return "Em breve";
  }

  useEffect(() => {
    if (jogo) {
      setDesenvolvedor(jogo.desenvolvedora || "Não informado");

      if (jogo.generos && jogo.generos.length > 0) {
        const primeiroGenero = jogo.generos[0];
        setGeneroPrincipal(primeiroGenero.nome || primeiroGenero);
      } else if (jogo.genero) {
        setGeneroPrincipal(jogo.genero);
      } else {
        setGeneroPrincipal("Ação");
      }

      let anoFormatado = "Em breve";
      if (jogo.lancamento) anoFormatado = formatarAno(jogo.lancamento);
      setDataLancamento(anoFormatado);

      let modo = "Single Player";
      if (jogo.modoJogo) modo = jogo.modoJogo;
      else if (jogo.multiplayer !== undefined) modo = jogo.multiplayer ? "Multiplayer" : "Single Player";
      setModoJogo(modo);
    }
  }, [jogo]);

  useEffect(() => {
    if (jogo && token) {
      carregarReviewUsuario();
      carregarReviews();
      verificarSeEstaNaBiblioteca();
    }
  }, [jogo, token]);

  async function verificarSeEstaNaBiblioteca() {
    try {
      const response = await fetch(`${API}/biblioteca/me`, {
        headers: { "token": `${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const existe = data.some(item => item.jogo?.id === jogo.id || item.jogoId === jogo.id);
        setNaBiblioteca(existe);
      }
    } catch (error) {
      console.error("Erro ao verificar biblioteca:", error);
    }
  }

  async function adicionarBiblioteca() {
    if (!token) {
      setMensagemBiblioteca("Faça login para adicionar à biblioteca");
      setTimeout(() => setMensagemBiblioteca(""), 3000);
      return;
    }

    setAdicionandoBiblioteca(true);
    setMensagemBiblioteca("");

    try {
      const response = await fetch(`${API}/biblioteca/${jogo.id}`, {
        method: "POST",
        headers: {
          "token": `${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setNaBiblioteca(true);
        setMensagemBiblioteca("✅ Jogo adicionado à sua biblioteca!");
        setTimeout(() => setMensagemBiblioteca(""), 3000);
      } else if (response.status === 409) {
        setMensagemBiblioteca("⚠️ Este jogo já está na sua biblioteca");
        setNaBiblioteca(true);
        setTimeout(() => setMensagemBiblioteca(""), 3000);
      } else {
        const error = await response.json();
        setMensagemBiblioteca(error.message || "Erro ao adicionar à biblioteca");
        setTimeout(() => setMensagemBiblioteca(""), 3000);
      }
    } catch (error) {
      setMensagemBiblioteca("Erro de conexão ao adicionar à biblioteca");
      setTimeout(() => setMensagemBiblioteca(""), 3000);
    } finally {
      setAdicionandoBiblioteca(false);
    }
  }

  async function carregarReviewUsuario() {
    setCarregandoReview(true);
    try {
      const response = await fetch(`${API}/jogos/${jogo.id}/reviews`, {
        headers: { "token": `${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        let reviewsList = [];
        if (data.itens) reviewsList = data.itens;
        else if (data.reviews) reviewsList = data.reviews;
        else if (Array.isArray(data)) reviewsList = data;
        const minhaReview = reviewsList.find(r => r.autorId === usuario?.id);
        if (minhaReview) {
          setReviewExistente(minhaReview);
          setReviewNota(minhaReview.nota || 5);
          setReviewTexto(minhaReview.texto || "");
          setReviewRecomenda(minhaReview.recomenda !== undefined ? minhaReview.recomenda : true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar review:", error);
    } finally {
      setCarregandoReview(false);
    }
  }

  async function carregarReviews() {
    setCarregandoReviews(true);
    try {
      const response = await fetch(`${API}/jogos/${jogo.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        let reviewsList = [];
        if (data.itens) reviewsList = data.itens;
        else if (data.reviews) reviewsList = data.reviews;
        else if (Array.isArray(data)) reviewsList = data;
        setReviews(reviewsList);
      }
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
    } finally {
      setCarregandoReviews(false);
    }
  }

  async function enviarReview(e) {
    e.preventDefault();
    if (!token) {
      setMensagemReview("Faça login para avaliar este jogo");
      return;
    }

    setEnviandoReview(true);
    setMensagemReview("");

    try {
      const metodo = reviewExistente ? "PUT" : "POST";
      const url = reviewExistente 
        ? `${API}/reviews/${reviewExistente.id}`
        : `${API}/jogos/${jogo.id}/reviews`;

      const response = await fetch(url, {
        method: metodo,
        headers: {
          "token": `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nota: reviewNota,
          texto: reviewTexto,
          recomenda: reviewRecomenda
        }),
      });

      if (response.ok) {
        setMensagemReview(reviewExistente ? "Review atualizada com sucesso!" : "Review enviada com sucesso!");
        setReviewExistente(null);
        setReviewNota(5);
        setReviewTexto("");
        setReviewRecomenda(true);
        carregarReviewUsuario();
        carregarReviews();
        setTimeout(() => setMensagemReview(""), 3000);
      } else {
        const error = await response.json();
        setMensagemReview(error.message || "Erro ao enviar review");
      }
    } catch (error) {
      setMensagemReview("Erro de conexão ao enviar review");
    } finally {
      setEnviandoReview(false);
    }
  }

  if (!jogo) {
    return <h2 style={{ color: "#fff", padding: "40px" }}>Jogo não encontrado</h2>;
  }

  const imagensExtras = jogo.imagens?.map(i => i.url) || [];

  const midias = [
    { type: "image", url: jogo.capaUrl || getFallbackImage(jogo.id) },
    ...imagensExtras.map(url => ({ type: "image", url })),
    ...(jogo.videoUrl ? [{ type: "video", url: jogo.videoUrl }] : [])
  ];

  const midiaAtual = midias[midiaIndex];

  function next(e) {
    e.stopPropagation();
    if (midias.length <= 1) return;
    setMidiaIndex(prev => prev === midias.length - 1 ? 0 : prev + 1);
  }

  function prev(e) {
    e.stopPropagation();
    if (midias.length <= 1) return;
    setMidiaIndex(prev => prev === 0 ? midias.length - 1 : prev - 1);
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

  const renderNotaStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${reviewNota >= i ? 'active' : ''}`}
          onClick={() => setReviewNota(i)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="detalhe-page">
      <div className="hero-background" style={{ backgroundImage: `url(${jogo.capaUrl || getFallbackImage(jogo.id)})` }}>
        <div className="hero-overlay">
          <div className="detalhe-container">
            <h1 className="game-title">{jogo.titulo}</h1>

            <div className="detalhe-top">
              <div className="detalhe-media">
                <div className="media-box">
                  <button type="button" className="arrow left" onClick={prev}>❮</button>
                  {midiaAtual?.type === "video" ? (
                    <video key={midiaAtual.url} controls autoPlay muted src={midiaAtual.url} />
                  ) : (
                    <img 
                      key={midiaAtual.url} 
                      src={midiaAtual.url} 
                      alt={jogo.titulo}
                      onError={(e) => handleImageError(e, jogo.id)}
                    />
                  )}
                  <button type="button" className="arrow right" onClick={next}>❯</button>
                </div>

                <div className="mini-gallery">
                  {midias.map((m, i) => (
                    <div key={i} className={i === midiaIndex ? "mini-thumb active" : "mini-thumb"} onClick={() => setMidiaIndex(i)}>
                      {m.type === "video" ? (
                        <video src={m.url} muted />
                      ) : (
                        <img 
                          src={m.url} 
                          alt=""
                          onError={(e) => handleThumbError(e, jogo.id, i)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="section game-about">
                  <h2>Sobre este jogo</h2>
                  <p>{jogo.sinopse || jogo.descricao || "Sem descrição disponível."}</p>
                </div>

                <div className="section">
                  <h2>Idiomas Suportados</h2>
                  <div className="language-grid">
                    <div>🇧🇷 Português</div>
                    <div>🇺🇸 Inglês</div>
                    <div>🇪🇸 Espanhol</div>
                    <div>🇫🇷 Francês</div>
                    <div>🇩🇪 Alemão</div>
                    <div>🇯🇵 Japonês</div>
                  </div>
                </div>

                <div className="section">
                  <h2>Requisitos do Sistema</h2>
                  <div className="req-grid">
                    <div>
                      <h3>Mínimos</h3>
                      <ul>
                        <li>SO: Windows 10</li>
                        <li>CPU: Intel i5</li>
                        <li>RAM: 8 GB</li>
                        <li>GPU: GTX 1050</li>
                        <li>Armazenamento: 20 GB</li>
                      </ul>
                    </div>
                    <div>
                      <h3>Recomendados</h3>
                      <ul>
                        <li>SO: Windows 11</li>
                        <li>CPU: Intel i7</li>
                        <li>RAM: 16 GB</li>
                        <li>GPU: RTX 3060</li>
                        <li>SSD recomendado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="reviews-section">
                  <h2>💬 Avaliações da Comunidade</h2>
                  
                  {carregandoReviews ? (
                    <div className="reviews-loading">Carregando avaliações...</div>
                  ) : reviews.length === 0 ? (
                    <div className="no-reviews">
                      <p>📝 Seja o primeiro a avaliar este jogo!</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="review-author">
                              <div className="author-avatar">👤</div>
                              <span className="author-name">{review.autor?.nome || "Usuário"}</span>
                            </div>
                            <div className="review-score">{review.nota}/10</div>
                          </div>
                          <p className="review-text">{review.texto || "Sem comentário"}</p>
                          <div className="review-footer">
                            <span className={`review-recommend ${review.recomenda ? 'positive' : 'negative'}`}>
                              {review.recomenda ? "👍 Recomendo" : "👎 Não recomendo"}
                            </span>
                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="user-review-section">
                  <h3>✍️ Sua Avaliação</h3>
                  
                  {carregandoReview ? (
                    <div className="reviews-loading">Carregando sua avaliação...</div>
                  ) : (
                    <form onSubmit={enviarReview} className="user-review-form">
                      <div className="form-group">
                        <label>Sua nota</label>
                        <div className="stars-container">
                          {renderNotaStars()}
                          <span className="nota-display">{reviewNota}/10</span>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Sua opinião</label>
                        <textarea
                          rows="3"
                          placeholder="Compartilhe sua experiência com este jogo..."
                          value={reviewTexto}
                          onChange={(e) => setReviewTexto(e.target.value)}
                        />
                      </div>
                      
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id="recomenda"
                          checked={reviewRecomenda}
                          onChange={(e) => setReviewRecomenda(e.target.checked)}
                        />
                        <label htmlFor="recomenda" className="checkbox-custom"></label>
                        <label htmlFor="recomenda" className="checkbox-label">
                          Recomendo este jogo para outros jogadores
                        </label>
                      </div>
                      
                      <button type="submit" disabled={enviandoReview} className="btn-submit-review">
                        {enviandoReview ? "Enviando..." : (reviewExistente ? "Atualizar Avaliação" : "Enviar Avaliação")}
                      </button>
                      
                      {mensagemReview && (
                        <div className={`review-message ${mensagemReview.includes("sucesso") || mensagemReview.includes("✨") ? "success" : "error"}`}>
                          {mensagemReview}
                        </div>
                      )}
                    </form>
                  )}
                </div>

              </div>

              <div className="detalhe-info">
                <img 
                  className="game-cover" 
                  src={jogo.capaUrl || getFallbackImage(jogo.id)} 
                  alt={jogo.titulo}
                  onError={(e) => handleImageError(e, jogo.id)}
                />
                <p className="desc">{jogo.descricao || jogo.sinopse || "Sem descrição disponível."}</p>

                <div className="price-card">
                  <div className="price-single">
                    <h2 className="game-price">R$ {jogo.preco}</h2>
                  </div>
                  
                  <button 
                    className={`btn-biblioteca ${naBiblioteca ? "na-biblioteca" : ""}`}
                    onClick={adicionarBiblioteca}
                    disabled={adicionandoBiblioteca || naBiblioteca}
                  >
                    {adicionandoBiblioteca ? "Adicionando..." : (naBiblioteca ? "✅ Na Biblioteca" : "📚 Adicionar à Biblioteca")}
                  </button>
                  
                  <button className="buy">🛒 Comprar</button>
                  
                  {mensagemBiblioteca && (
                    <div className={`biblioteca-mensagem ${mensagemBiblioteca.includes("✅") ? "success" : mensagemBiblioteca.includes("⚠️") ? "warning" : "error"}`}>
                      {mensagemBiblioteca}
                    </div>
                  )}
                </div>

                <div className="info-card">
                  <h3>Informações</h3>
                  <div className="info-item">
                    <span>Desenvolvedor</span>
                    <strong>{desenvolvedor}</strong>
                  </div>
                  <div className="info-item">
                    <span>Gênero</span>
                    <strong>{generoPrincipal}</strong>
                  </div>
                  <div className="info-item">
                    <span>Lançamento</span>
                    <strong>{dataLancamento}</strong>
                  </div>
                  <div className="info-item">
                    <span>Modo</span>
                    <strong>{modoJogo}</strong>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Categoria/Gênero</h3>
                  <div className="tags">
                    {jogo.generos && jogo.generos.length > 0 ? (
                      jogo.generos.map((g, i) => (
                        <span key={i}>{g.nome || g}</span>
                      ))
                    ) : (
                      <>
                        <span>Ação</span>
                        <span>Aventura</span>
                        <span>Popular</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}