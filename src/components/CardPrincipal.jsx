import "../CSS/cardPrincipal.css";
import { useNavigate } from "react-router-dom";

export default function CardPrincipal({
  jogo,
  proximoJogo,
  voltarJogo
}) {
  const navigate = useNavigate();

  if (!jogo) return null;

  // ✔ imagens reais (NUNCA inclui capaUrl aqui)
  const imagens = jogo.imagens?.length >= 0 ? jogo.imagens : [];

  function abrirDetalhes() {
    navigate(`/jogo/${jogo.id}`);
  }

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
          <img
            src={jogo.capaUrl || "https://placehold.co/1200x600"}
            alt={jogo.titulo}
          />
        </div>

        {/* INFO DIREITA */}
        <div className="featured-right">

          <h1>{jogo.titulo}</h1>

          {/* MINI IMAGENS (só se existir de verdade) */}
          <div className="mini-images">

            {imagens.length > 0 ? (
              imagens.slice(0, 4).map((img) => (
                <img
                  key={img.id || img.url}
                  src={img.url}
                  alt={img.legenda || jogo.titulo}
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

        {/* HOVER */}
        <div className="featured-hover">

          <h3>{jogo.titulo}</h3>

          <p className="featured-genre">
            {jogo.generos?.[0]?.nome || "Ação"}
          </p>

          {/* preview no hover (também só imagens reais) */}
          <div className="featured-images">

            {imagens.slice(0, 2).map((img) => (
              <img
                key={img.id || img.url}
                src={img.url}
                alt={img.legenda || jogo.titulo}
              />
            ))}

          </div>

          <p className="featured-review">
            Muito positivas
          </p>

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