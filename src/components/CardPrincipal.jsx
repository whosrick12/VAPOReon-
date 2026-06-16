import "../CSS/cardPrincipal.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CardPrincipal({
  jogo,
  proximoJogo,
  voltarJogo
}) {
  const navigate = useNavigate();
  const [imagemAtual, setImagemAtual] = useState(null);

  if (!jogo) return null;

  // ✔ imagens reais (NUNCA inclui capaUrl aqui)
  const imagens = jogo.imagens?.length >= 0 ? jogo.imagens : [];

  // Lista de imagens de fallback (jogos REAIS hospedados no Cloudinary)
  const imagensFallback = [
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580834/thelast_zxvx3i.jpg",      // The Last of Us
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580834/Black-Myth-Wukong_tgp8tn.jpg", // Black Myth: Wukong
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580833/dark-souls-remastered_pn596o.jpg", // Dark Souls
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580829/re4_arplj8.png",           // Resident Evil 4
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580831/days-gone-zombie-strike-poster-808vz2axmhw4zege_sqmwjr.jpg", // Days Gone
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580830/godw_utrvkr.png",         // God of War
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580829/elden_q1u1ki.jpg",         // Elden Ring
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580826/20221117-ovicio-red-dead-capa_tmlbiw.webp", // Red Dead
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/3a713d5c-b4cb-4672-acbd-5a1fdfac79d8_zq4zab.jpg", // Alternativa
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/gowR_ddobbo.webp",        // God of War Ragnarök
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580825/fundo-de-dying-light-869t85ft652ly3jc_ravpum.jpg", // Dying Light
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580825/F077DBEWIAYzW5L.jpg_mdmwfh.webp", // EA Sports FC
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580266/re4_igldoy.png",           // RE4 alternativo
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580827/a5h4887tvu4b1_oewrjg.jpg", // Alternativa
    "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580832/20230314-ovicio-outlast-2-capa_g3jhbo.webp" // Outlast 2
  ];

  // Função para pegar uma imagem de fallback baseada no ID do jogo
  const getFallbackImage = (jogoId) => {
    const index = (jogoId || 1) % imagensFallback.length;
    return imagensFallback[index];
  };

  // Pré-carrega a imagem no mount do componente
  useEffect(() => {
    const url = jogo.capaUrl || getFallbackImage(jogo.id);
    const img = new Image();
    img.onload = () => setImagemAtual(url);
    img.onerror = () => setImagemAtual(getFallbackImage(jogo.id));
    img.src = url;
  }, [jogo.id, jogo.capaUrl]);

  function abrirDetalhes() {
    navigate(`/jogo/${jogo.id}`);
  }

  // Função para tratar erro de imagem
  const handleImageError = (e) => {
    if (e.target.src !== getFallbackImage(jogo.id)) {
      e.target.src = getFallbackImage(jogo.id);
    }
  };

  return (
    <div className="featured-container">

      <button
        className="back-preview"
        onClick={voltarJogo}
      >
        ❮
      </button>

      <div
        className="featured-card"
        onClick={abrirDetalhes}
        style={{ cursor: "pointer" }}
      >

        {/* CAPA PRINCIPAL */}
        <div className="featured-left">
          {imagemAtual ? (
            <img
              src={imagemAtual}
              alt={jogo.titulo}
              onError={handleImageError}
              loading="eager"
            />
          ) : (
            <div style={{ 
              width: "100%", 
              height: "100%", 
              background: "#1a1f2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666"
            }}>
              Carregando...
            </div>
          )}
        </div>

        {/* INFO DIREITA */}
        <div className="featured-right">

          <h1>{jogo.titulo}</h1>

          {/* MINI IMAGENS (só se existir de verdade) */}
          <div className="mini-images">

            {imagens.length > 0 ? (
              imagens.slice(0, 4).map((img, idx) => (
                <img
                  key={img.id || img.url || idx}
                  src={img.url}
                  alt={img.legenda || jogo.titulo}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  loading="lazy"
                />
              ))
            ) : (
              <p style={{ color: "#aaa", fontSize: "12px" }}>
                Sem imagens adicionais
              </p>
            )}

          </div>

          {/* PREÇO */}
          <div className="price-area">

            <span className="popular-tag">
              Popular
            </span>

            <div className="price-box-main">

              <span className="price-label">
                Preço
              </span>

              <strong>
                R$ {jogo.preco}
              </strong>

            </div>

          </div>

        </div>

        {/* HOVER - REMOVIDO O "Muito positivas" */}
        <div className="featured-hover">

          <h3>{jogo.titulo}</h3>

          <p className="featured-genre">
            {jogo.generos?.[0]?.nome || "Ação"}
          </p>

          {/* preview no hover (também só imagens reais) */}
          <div className="featured-images">

            {imagens.slice(0, 2).map((img, idx) => (
              <img
                key={img.id || img.url || idx}
                src={img.url}
                alt={img.legenda || jogo.titulo}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                loading="lazy"
              />
            ))}

          </div>

          {/* REMOVIDO O <p> Muito positivas */}

        </div>

      </div>

      <button
        className="next-preview"
        onClick={proximoJogo}
      >
        ❯
      </button>

    </div>
  );
}