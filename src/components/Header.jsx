import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../CSS/Header.css";

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

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
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          Store
        </a>

        <a
          href="/perfil"
          onClick={(e) => {
            e.preventDefault();
            navigate("/perfil");
          }}
        >
          Meu Perfil
        </a>

        <a
          href="/library"
          onClick={(e) => {
            e.preventDefault();
            navigate("/library");
          }}
        >
          Library
        </a>

        <a
          href="/support"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Support
        </a>
      </nav>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search games..."
        />
      </div>

      <div className="profile">
        {usuario ? (
          <>
            <img
              src={
                usuario.avatar ||
                "https://i.pravatar.cc/40"
              }
              alt="profile"
              onClick={() => navigate("/perfil")}
              style={{ cursor: "pointer" }}
            />

            <div
              onClick={() => navigate("/perfil")}
              style={{ cursor: "pointer" }}
            >
              <h4>{usuario.nome}</h4>

              <span>
                Level {usuario.steamLevel || 1}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Sair
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="login-button"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}