import "../CSS/cardPrincipal.css";
import { useNavigate } from "react-router-dom";


export default function CardPrincipal({
  jogo,
  proximoJogo,
  voltarJogo
}) {
  const navigate = useNavigate();

  if (!jogo) return null;

  const imagens =
    jogo.imagens && jogo.imagens.length > 0
      ? jogo.imagens
      : [
        { url: jogo.imagens?.[1]?.url },
        { url: jogo.capaUrl },
        { url: jogo.capaUrl },
        { url: jogo.capaUrl }
      ];

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

        <div className="featured-left">
          <img
            src={
              jogo.capaUrl ||
              "https://placehold.co/1200x600/111827/ffffff?text=Sem+Imagem"
            }
            alt={jogo.titulo}
          />
        </div>

        <div className="featured-right">

          <h1>{jogo.titulo}</h1>

          <div className="mini-images">

            {imagens.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={
                  img.url ||
                  jogo.capaUrl ||
                  "https://placehold.co/300x200"
                }
                alt=""
              />
            ))}

          </div>

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

      
        <div className="featured-hover">

          <h3>{jogo.titulo}</h3>

          <p className="featured-genre">
            {jogo.generos?.[0]?.nome || "Ação"}
          </p>

          <div className="featured-images">

            <img
              src={jogo.capaUrl || "https://placehold.co/300x200"}
              alt=""
            />

            <img
              src={jogo.capaUrl || "https://placehold.co/300x200"}
              alt=""
            />

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