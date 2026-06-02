import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserGames } from "../services/fakeDatabase";
import API from "../services/api";
import "../CSS/Biblioteca.css";

export default function Biblioteca() {
  const { usuario, token } = useAuth();

  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  useEffect(() => {
    async function carregarBiblioteca() {
      if (!usuario) return;

      try {
        try {
          const res = await fetch(`${API}/biblioteca/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();

            setJogos(data);

            if (data.length > 0) {
              setJogoSelecionado(data[0]);
            }

            return;
          }
        } catch {
          console.log("Usando biblioteca local");
        }

        const jogosLocais = getUserGames(usuario.id);

        setJogos(jogosLocais);

        if (jogosLocais.length > 0) {
          setJogoSelecionado(jogosLocais[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarBiblioteca();
  }, [usuario, token]);

  const jogosFiltrados = jogos.filter((jogo) =>
    jogo.titulo?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className="library-loading">
        Carregando biblioteca...
      </div>
    );
  }

  return (
    <div className="library-page">
      {/* SIDEBAR */}

      <div className="library-sidebar">
        <h2>Biblioteca</h2>

        <div className="library-total">
          {jogos.length} jogos
        </div>

        <input
          type="text"
          placeholder="Pesquisar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="library-search"
        />

        <div className="library-list">
          {jogosFiltrados.map((jogo) => (
            <div
              key={jogo.id}
              className={`library-game ${
                jogoSelecionado?.id === jogo.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setJogoSelecionado(jogo)
              }
            >
              <img
                src={jogo.capaUrl}
                alt={jogo.titulo}
              />

              <div>
                <h4>{jogo.titulo}</h4>

                <span>
                  {jogo.horasJogadas || 0} horas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}

      <div className="library-content">
        {jogoSelecionado ? (
          <>
            <div
              className="library-banner"
              style={{
                backgroundImage: `url(${jogoSelecionado.capaUrl})`,
              }}
            >
              <div className="library-overlay">
                <h1>
                  {jogoSelecionado.titulo}
                </h1>

                <p>
                  {jogoSelecionado.descricao ||
                    "Sem descrição disponível."}
                </p>

                <button className="btn-play">
                  ▶ Jogar
                </button>
              </div>
            </div>

            <div className="library-stats">
              <div className="stat-box">
                <h3>
                  {jogoSelecionado.horasJogadas || 0}
                </h3>

                <span>Horas jogadas</span>
              </div>

              <div className="stat-box">
                <h3>
                  {jogoSelecionado.conquistas || 0}
                </h3>

                <span>Conquistas</span>
              </div>

              <div className="stat-box">
                <h3>
                  {jogoSelecionado.ultimaVez
                    ? new Date(
                        jogoSelecionado.ultimaVez
                      ).toLocaleDateString("pt-BR")
                    : "Nunca"}
                </h3>

                <span>Última sessão</span>
              </div>
            </div>

            <div className="library-about">
              <h2>Sobre este jogo</h2>

              <p>
                {jogoSelecionado.sinopse ||
                  jogoSelecionado.descricao}
              </p>
            </div>

            <div className="library-gallery">
              <h2>Capturas de tela</h2>

              <div className="gallery-grid">
                {jogoSelecionado.imagens?.length > 0 ? (
                  jogoSelecionado.imagens.map(
                    (img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt=""
                      />
                    )
                  )
                ) : (
                  <img
                    src={jogoSelecionado.capaUrl}
                    alt=""
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="library-empty">
            Nenhum jogo encontrado.
          </div>
        )}
      </div>
    </div>
  );
}