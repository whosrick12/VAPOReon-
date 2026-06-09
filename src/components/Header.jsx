import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../CSS/Header.css";

export default function Header({ jogos = [] }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const searchRef = useRef(null);

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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <div
        className="logo-container"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img
          className="logo-box"
          src="https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/134.png"
          alt=""
        />
        <h1 className="logo-text">
          <span className="vapor">VAPOR</span>
          <span className="eon">eon</span>
        </h1>
      </div>

      <nav className="nav">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Store</a>
        <a href="/perfil" onClick={(e) => { e.preventDefault(); navigate("/perfil"); }}>Meu Perfil</a>
        <a href="/biblioteca" onClick={(e) => { e.preventDefault(); navigate("/biblioteca"); }}>Library</a>
        <a href="/support" onClick={(e) => e.preventDefault()}>Support</a>
      </nav>

      <div className="search-container" ref={searchRef}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search games..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => busca.length >= 2 && setMostrarResultados(true)}
          />
          {busca && (
            <button className="search-clear" onClick={() => setBusca("")}>✕</button>
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

      <div className="profile">
        {usuario ? (
          <>
            <img
              src={usuario.avatar || "https://i.pravatar.cc/40"}
              alt="profile"
              onClick={() => navigate("/perfil")}
              style={{ cursor: "pointer" }}
            />
            <div onClick={() => navigate("/perfil")} style={{ cursor: "pointer" }}>
              <h4>{usuario.nome}</h4>
              <span>Level {usuario.steamLevel || 1}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">Sair</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")} className="login-button">
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}