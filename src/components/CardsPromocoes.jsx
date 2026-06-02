import { useState } from "react";
import { useNavigate } from "react-router-dom";
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&display=swap"
  rel="stylesheet"
/>
import "../CSS/cardsPromocoes.css";

export default function CardsPromocoes({ jogos }) {

  const navigate = useNavigate();

  const [indexAtual, setIndexAtual] = useState(0);

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

    navigate(`/jogo/${id}`);

  }

  return (

    <div className="discount-section">

      {/* HEADER */}
      <div className="discount-header">

        <h2>Descontos e eventos</h2>

        <button>VER MAIS</button>

      </div>

      {/* CONTEÚDO */}
      <div className="discount-content">

        {/* BOTÃO ESQUERDA */}
        <button
          className="previous-slide"
          onClick={slideAnterior}
        >
          ❮
        </button>

        {/* CARDS */}
        <div className="discount-cards">

          {/* CARD 1 */}
          <div
            className="game-card"
            onClick={() => abrirDetalhes(jogos[indexAtual]?.id)}
            style={{ cursor: "pointer" }}
          >

            <img
              src={
                jogos[indexAtual]?.capaUrl ||
                "https://placehold.co/600x400"
              }
              alt=""
            />

            <div className="hover-details">

              <h3>
                {jogos[indexAtual]?.titulo}
              </h3>

              <p className="release-date">
                Lançado recentemente
              </p>

              <div className="hover-images">

                <img
                  src={
                    jogos[indexAtual]?.capaUrl ||
                    "https://placehold.co/600x400"
                  }
                  alt=""
                />

                <img
                  src={
                    jogos[indexAtual]?.capaUrl ||
                    "https://placehold.co/600x400"
                  }
                  alt=""
                />

              </div>

              <p className="review-text">
                Muito positivas
              </p>

              <div className="hover-tags">

                <span>
                  {jogos[indexAtual]?.generos?.[0]?.nome || "Ação"}
                </span>

                <span>Online</span>

                <span>Popular</span>

              </div>

            </div>

            <div className="game-info">

              <h3>
                {jogos[indexAtual]?.titulo}
              </h3>

              <div className="price-box">

                <span className="discount">
                  -55%
                </span>

                <div className="prices">

                  <small>
                    R$ 39,99
                  </small>

                <strong>
  {(
    Number(jogos[indexAtual]?.preco || 0) *
    (1 - 0.55)
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
</strong>

                </div>

              </div>

            </div>

          </div>


          {/* CARD 2 */}
          <div
            className="game-card"
            onClick={() => abrirDetalhes(jogos[indexAtual + 1]?.id)}
            style={{ cursor: "pointer" }}
          >

            <img
              src={
                jogos[indexAtual + 1]?.capaUrl ||
                "https://placehold.co/600x400"
              }
              alt=""
            />

            <div className="game-info">

              <h3>
                {jogos[indexAtual + 1]?.titulo}
              </h3>

              <div className="price-box">

                <span className="discount">
                  -85%
                </span>

                <div className="prices">

                  <small>
                    R$ 47,49
                  </small>

                  <strong>
                    {Number(jogos[indexAtual + 1]?.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>

                </div>

              </div>

            </div>

            <div className="hover-details">

              <h3>
                {jogos[indexAtual + 1]?.titulo}
              </h3>

              <p className="release-date">
                Lançado recentemente
              </p>

              <div className="hover-images">

                <img
                  src={
                    jogos[indexAtual + 1]?.capaUrl ||
                    "https://placehold.co/300x200"
                  }
                  alt=""
                />

                <img
                  src={
                    jogos[indexAtual + 1]?.capaUrl ||
                    "https://placehold.co/300x200"
                  }
                  alt=""
                />

              </div>

              <p className="review-text">
                Muito positivas
              </p>

              <div className="hover-tags">

                <span>
                  {jogos[indexAtual + 1]?.generos?.[0]?.nome || "Ação"}
                </span>

                <span>Open World</span>

                <span>Multiplayer</span>

              </div>

            </div>

          </div>


          {/* COLUNA DIREITA */}
          <div className="side-column">

            {/* MINI CARD 1 */}
            <div
              className="mini-card"
              onClick={() => abrirDetalhes(jogos[indexAtual + 2]?.id)}
              style={{ cursor: "pointer" }}
            >

              <img
                src={
                  jogos[indexAtual + 2]?.capaUrl ||
                  "https://placehold.co/600x400"
                }
                alt=""
              />

              {/* HOVER */}
              <div className="mini-hover-details">

                <h4>
                  {jogos[indexAtual + 2]?.titulo}
                </h4>

                <p className="mini-genre">
                  {jogos[indexAtual + 2]?.generos?.[0]?.nome || "Ação"}
                </p>

                <div className="mini-hover-imgs">

                  <img
                    src={
                      jogos[indexAtual + 2]?.capaUrl ||
                      "https://placehold.co/200x120"
                    }
                    alt=""
                  />

                  <img
                    src={
                      jogos[indexAtual + 2]?.capaUrl ||
                      "https://placehold.co/200x120"
                    }
                    alt=""
                  />

                </div>

                <span className="mini-review">
                  Muito positivas
                </span>

              </div>

              {/* INFO NORMAL */}
              <div className="mini-info">

                <span>
                  {jogos[indexAtual + 2]?.titulo}
                </span>

                <div className="mini-price">

                  <strong>-85%</strong>
                  <p>
                    {Number(jogos[indexAtual + 2]?.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>

                </div>

              </div>

            </div>


            {/* MINI CARD 2 */}
            <div
              className="mini-card"
              onClick={() => abrirDetalhes(jogos[indexAtual + 3]?.id)}
              style={{ cursor: "pointer" }}
            >

              <img
                src={
                  jogos[indexAtual + 3]?.capaUrl ||
                  "https://placehold.co/600x400"
                }
                alt=""
              />

              {/* HOVER */}
              <div className="mini-hover-details">

                <h4>
                  {jogos[indexAtual + 3]?.titulo}
                </h4>

                <p className="mini-genre">
                  {jogos[indexAtual + 3]?.generos?.[0]?.nome || "Ação"}
                </p>

                <div className="mini-hover-imgs">

                  <img
                    src={
                      jogos[indexAtual + 3]?.capaUrl ||
                      "https://placehold.co/200x120"
                    }
                    alt=""
                  />

                  <img
                    src={
                      jogos[indexAtual + 3]?.capaUrl ||
                      "https://placehold.co/200x120"
                    }
                    alt=""
                  />

                </div>

                <span className="mini-review">
                  Muito positivas
                </span>

              </div>

              {/* INFO NORMAL */}
              <div className="mini-info">

                <span>
                  {jogos[indexAtual + 3]?.titulo}
                </span>

                <div className="mini-price">

                  <strong>-40%</strong>
                  <p>
                    {Number(jogos[indexAtual + 3]?.preco || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        <button
          className="next-slide"
          onClick={proximoSlide}
        >
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