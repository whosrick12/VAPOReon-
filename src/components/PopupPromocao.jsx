import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/PopupPromocao.css";

export default function PopupPromocao({ jogos }) {

  const [aberto, setAberto] = useState(false);
  const [slide, setSlide] = useState(0);

  const navigate = useNavigate();

  // Função para verificar se pode mostrar o popup (baseado nos 5 minutos)
  function podeMostrarPopup() {
    const ultimaExibicao = localStorage.getItem('ultimaExibicaoPopup');
    
    if (!ultimaExibicao) {
      return true; // Nunca foi mostrado, pode mostrar
    }
    
    const agora = Date.now();
    const cincoMinutos = 5 * 60 * 1000; // 5 minutos em milissegundos
    
    return (agora - parseInt(ultimaExibicao)) >= cincoMinutos;
  }

  // Função para registrar que o popup foi mostrado agora
  function registrarExibicao() {
    localStorage.setItem('ultimaExibicaoPopup', Date.now().toString());
  }

  // Função para tentar abrir o popup
  function tentarAbrirPopup() {
    if (podeMostrarPopup() && jogos.length > 0) {
      setAberto(true);
      registrarExibicao();
    }
  }

  // Efeito principal - mostra o popup após 1.2 segundos
  useEffect(() => {
    if (!jogos.length) return;

    const timer = setTimeout(() => {
      tentarAbrirPopup();
    }, 1200);

    return () => clearTimeout(timer);
  }, [jogos.length]);

  // Efeito para auto-slide
  useEffect(() => {
    if (!aberto) return;

    const autoSlide = setInterval(() => {
      setSlide(prev =>
        prev >= jogos.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(autoSlide);
  }, [aberto, jogos.length]);

  if (!aberto || jogos.length === 0) {
    return null;
  }

  const jogo = jogos[slide];

  function fechar() {
    setAberto(false);
  }

  function next() {
    setSlide(prev =>
      prev >= jogos.length - 1 ? 0 : prev + 1
    );
  }

  function prev() {
    setSlide(prev =>
      prev <= 0 ? jogos.length - 1 : prev - 1
    );
  }

  function abrirDetalhes() {
    navigate(`/jogo/${jogo.id}`);
    setAberto(false);
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button
          className="popup-close"
          onClick={fechar}
        >
          ✕
        </button>

        <div className="popup-card">
          <div className="popup-banner">
            <img
              src={
                jogo.bannerUrl ||
                jogo.capaUrl ||
                "https://placehold.co/1200x600"
              }
              alt={jogo.titulo}
            />

            <div className="popup-badge">
              OFERTA DA SEMANA
            </div>

            <div className="popup-gradient">
              <div className="popup-info">
                <div className="popup-tags">
                  <span>
                    {jogo.generos?.[0]?.nome || "Ação"}
                  </span>
                  <span>Popular</span>
                  <span>Online</span>
                </div>

                <h2>{jogo.titulo}</h2>
                <p>{jogo.descricao?.slice(0, 150)}...</p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="popup-footer">
            <div className="popup-price-footer">
              <span>Preço Atual</span>
              <div className="popup-price">
                <span className="discount">-75%</span>
                <div>
                  <small>R$ 199,90</small>
                  <strong>R$ {jogo.preco}</strong>
                </div>
              </div>
            </div>

            <button
              className="popup-details"
              onClick={abrirDetalhes}
            >
              Ver Jogo
            </button>
          </div>
        </div>

        {/* DOTS */}
        <div className="popup-dots">
          {jogos.slice(0, 5).map((_, i) => (
            <span
              key={i}
              onClick={() => setSlide(i)}
              className={i === slide ? "active" : ""}
            />
          ))}
        </div>

        {/* NAVEGAÇÃO */}
        <div className="popup-navigation">
          <button className="popup-nav-btn" onClick={prev}>
            ❮ Anterior
          </button>
          <button className="popup-nav-btn" onClick={next}>
            Próximo ❯
          </button>
        </div>
      </div>
    </div>
  );
}