import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/SearchBar.css";

export default function SearchBar({ jogos }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (busca.length >= 2) {
      const filtrados = jogos.filter(jogo =>
        jogo.titulo?.toLowerCase().includes(busca.toLowerCase())
      );
      setResultados(filtrados.slice(0, 8));
      setMostrarResultados(true);
    } else {
      setResultados([]);
      setMostrarResultados(false);
    }
  }, [busca, jogos]);

  function handleJogoClick(jogoId) {
    setBusca("");
    setMostrarResultados(false);
    navigate(`/jogo/${jogoId}`);
  }

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar jogos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onFocus={() => busca.length >= 2 && setMostrarResultados(true)}
          className="search-input"
        />
        {busca && (
          <button className="search-clear" onClick={() => setBusca("")}>
            ✕
          </button>
        )}
      </div>

      {mostrarResultados && resultados.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <span>Resultados da pesquisa</span>
            <span className="results-count">{resultados.length} jogos</span>
          </div>
          {resultados.map((jogo) => {
            const precoComDesconto = jogo.preco * 0.75;
            const desconto = 25;
            return (
              <div
                key={jogo.id}
                className="search-result-item"
                onClick={() => handleJogoClick(jogo.id)}
              >
                <img src={jogo.capaUrl} alt={jogo.titulo} className="result-image" />
                <div className="result-info">
                  <h4>{jogo.titulo}</h4>
                  <div className="result-price">
                    <span className="result-discount">-{desconto}%</span>
                    <span className="result-old-price">R$ {jogo.preco.toFixed(2)}</span>
                    <span className="result-new-price">R$ {precoComDesconto.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostrarResultados && busca.length >= 2 && resultados.length === 0 && (
        <div className="search-results empty">
          <div className="no-results">
            <span>🔍</span>
            <p>Nenhum jogo encontrado para "{busca}"</p>
          </div>
        </div>
      )}
    </div>
  );
}