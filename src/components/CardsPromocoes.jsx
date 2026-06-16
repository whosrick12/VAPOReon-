import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/cardsPromocoes.css";

export default function CardsPromocoes({ jogos }) {

  const navigate = useNavigate();
  const [indexAtual, setIndexAtual] = useState(0);

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
    const index = (jogoId || 1) % imagensFallback.length;
    return imagensFallback[index];
  };

  // Função para tratar erro de imagem da capa
  const handleImageError = (e, jogoId) => {
    if (e.target.src !== getFallbackImage(jogoId)) {
      e.target.src = getFallbackImage(jogoId);
    }
  };

  // Função para tratar erro de imagem do hover (só esconde)
  const handleHoverImageError = (e) => {
    e.target.style.display = "none";
  };

  function proximoSlide() {
    if (indexAtual < jogos.length - 4) {
      setIndexAtual(indexAtual + 1);
    }
  }

  function slideAnterior() {
    if (indexAtual > 0) {
      setIndexAtual(indexAtual - 1);
    }
  }

  function abrirDetalhes(id) {
    if (id) {
      navigate(`/jogo/${id}`);
    }
  }

  // Verifica se o jogo existe
  const getJogo = (offset) => {
    const jogo = jogos[indexAtual + offset];
    return jogo || null;
  };

  // Pega as imagens reais do jogo para o hover
  const getImagensHover = (jogo, max = 2) => {
    if (!jogo) return [];
    // Usa as imagens reais do jogo (se existirem)
    if (jogo.imagens && jogo.imagens.length > 0) {
      return jogo.imagens.slice(0, max);
    }
    return [];
  };

  return (
    <div className="discount-section">

      {/* HEADER */}
      <div className="discount-header">
        <h2>Jogos em Destaque</h2>
        <button>VER MAIS</button>
      </div>

      {/* CONTEÚDO */}
      <div className="discount-content">

        {/* BOTÃO ESQUERDA */}
        <button className="previous-slide" onClick={slideAnterior}>
          ❮
        </button>

        {/* CARDS */}
        <div className="discount-cards">

          {/* CARD 1 */}
          {getJogo(0) && (
            <div
              className="game-card"
              onClick={() => abrirDetalhes(getJogo(0)?.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={getJogo(0)?.capaUrl || getFallbackImage(getJogo(0)?.id)}
                alt={getJogo(0)?.titulo}
                onError={(e) => handleImageError(e, getJogo(0)?.id)}
                loading="lazy"
              />

              <div className="hover-details">
                <h3>{getJogo(0)?.titulo}</h3>
                <p className="release-date">Lançado recentemente</p>
                <div className="hover-images">
                  {getImagensHover(getJogo(0), 2).map((img, idx) => (
                    <img
                      key={img.id || idx}
                      src={img.url}
                      alt={img.legenda || getJogo(0)?.titulo}
                      onError={handleHoverImageError}
                    />
                  ))}
                </div>
                <div className="hover-tags">
                  <span>{getJogo(0)?.generos?.[0]?.nome || "Ação"}</span>
                  <span>Online</span>
                  <span>Popular</span>
                </div>
              </div>

              <div className="game-info">
                <h3>{getJogo(0)?.titulo}</h3>
                <div className="price-box">
                  <div className="prices">
                    <strong>
                      {Number(getJogo(0)?.preco || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARD 2 */}
          {getJogo(1) && (
            <div
              className="game-card"
              onClick={() => abrirDetalhes(getJogo(1)?.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={getJogo(1)?.capaUrl || getFallbackImage(getJogo(1)?.id)}
                alt={getJogo(1)?.titulo}
                onError={(e) => handleImageError(e, getJogo(1)?.id)}
                loading="lazy"
              />

              <div className="game-info">
                <h3>{getJogo(1)?.titulo}</h3>
                <div className="price-box">
                  <div className="prices">
                    <strong>
                      {Number(getJogo(1)?.preco || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="hover-details">
                <h3>{getJogo(1)?.titulo}</h3>
                <p className="release-date">Lançado recentemente</p>
                <div className="hover-images">
                  {getImagensHover(getJogo(1), 2).map((img, idx) => (
                    <img
                      key={img.id || idx}
                      src={img.url}
                      alt={img.legenda || getJogo(1)?.titulo}
                      onError={handleHoverImageError}
                    />
                  ))}
                </div>
                <div className="hover-tags">
                  <span>{getJogo(1)?.generos?.[0]?.nome || "Ação"}</span>
                  <span>Open World</span>
                  <span>Multiplayer</span>
                </div>
              </div>
            </div>
          )}

          {/* COLUNA DIREITA */}
          <div className="side-column">

            {/* MINI CARD 1 */}
            {getJogo(2) && (
              <div
                className="mini-card"
                onClick={() => abrirDetalhes(getJogo(2)?.id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getJogo(2)?.capaUrl || getFallbackImage(getJogo(2)?.id)}
                  alt={getJogo(2)?.titulo}
                  onError={(e) => handleImageError(e, getJogo(2)?.id)}
                  loading="lazy"
                />

                {/* HOVER */}
                <div className="mini-hover-details">
                  <h4>{getJogo(2)?.titulo}</h4>
                  <p className="mini-genre">{getJogo(2)?.generos?.[0]?.nome || "Ação"}</p>
                  <div className="mini-hover-imgs">
                    {getImagensHover(getJogo(2), 2).map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.url}
                        alt={img.legenda || getJogo(2)?.titulo}
                        onError={handleHoverImageError}
                      />
                    ))}
                  </div>
                </div>

                {/* INFO NORMAL */}
                <div className="mini-info">
                  <span>{getJogo(2)?.titulo}</span>
                  <div className="mini-price">
                    <p>
                      {Number(getJogo(2)?.preco || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MINI CARD 2 */}
            {getJogo(3) && (
              <div
                className="mini-card"
                onClick={() => abrirDetalhes(getJogo(3)?.id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getJogo(3)?.capaUrl || getFallbackImage(getJogo(3)?.id)}
                  alt={getJogo(3)?.titulo}
                  onError={(e) => handleImageError(e, getJogo(3)?.id)}
                  loading="lazy"
                />

                {/* HOVER */}
                <div className="mini-hover-details">
                  <h4>{getJogo(3)?.titulo}</h4>
                  <p className="mini-genre">{getJogo(3)?.generos?.[0]?.nome || "Ação"}</p>
                  <div className="mini-hover-imgs">
                    {getImagensHover(getJogo(3), 2).map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.url}
                        alt={img.legenda || getJogo(3)?.titulo}
                        onError={handleHoverImageError}
                      />
                    ))}
                  </div>
                </div>

                {/* INFO NORMAL */}
                <div className="mini-info">
                  <span>{getJogo(3)?.titulo}</span>
                  <div className="mini-price">
                    <p>
                      {Number(getJogo(3)?.preco || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        <button className="next-slide" onClick={proximoSlide}>
          ❯
        </button>

      </div>

      <div className="slider-dots">
        <span className="active-dot"></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>

  );
}