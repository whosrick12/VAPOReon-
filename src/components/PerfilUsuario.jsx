import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser, getUserGames } from "../services/fakeDatabase";
import API from "../services/api";
import "../CSS/perfilUsuario.css";

export default function PerfilUsuario() {
  const { usuario, token, logout } = useAuth();

  const [editando, setEditando] = useState(false);

  const [nome, setNome] = useState(
    usuario?.nome || ""
  );

  const [bio, setBio] = useState(
    usuario?.bio || ""
  );

  const [avatar, setAvatar] = useState(
    usuario?.avatar || ""
  );

  const [mensagem, setMensagem] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [biblioteca, setBiblioteca] =
    useState([]);

  const [wishlist, setWishlist] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [conquistas, setConquistas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [ativos, setAtivos] =
    useState("biblioteca");

  useEffect(() => {
    async function carregarDadosUsuario() {
      if (!usuario?.id) return;

      setLoading(true);

      try {
        try {
          const res = await fetch(
            `${API}/biblioteca/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            const data =
              await res.json();

            setBiblioteca(data);
          }
        } catch {
          const userGames =
            getUserGames(usuario.id);

          setBiblioteca(userGames);
        }

        try {
          const res = await fetch(
            `${API}/wishlist/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            const data =
              await res.json();

            setWishlist(data);
          }
        } catch {
          setWishlist([]);
        }

        try {
          const res = await fetch(
            `${API}/reviews?autorId=${usuario.id}`
          );

          if (res.ok) {
            const data =
              await res.json();

            setReviews(
              data.itens || []
            );
          }
        } catch {
          setReviews([]);
        }

        try {
          const res = await fetch(
            `${API}/conquistas?usuarioId=${usuario.id}`
          );

          if (res.ok) {
            const data =
              await res.json();

            setConquistas(
              data.itens || []
            );
          }
        } catch {
          setConquistas([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosUsuario();
  }, [usuario, token]);

  function handleEditar() {
    setEditando(true);
  }

  function handleCancelar() {
    setNome(usuario.nome);
    setBio(usuario.bio || "");
    setAvatar(usuario.avatar);

    setEditando(false);

    setMensagem("");
    setErro("");
  }

  function handleSalvar() {
    try {
      const usuarioAtualizado =
        updateUser(usuario.id, {
          nome,
          bio,
          avatar,
        });

      localStorage.setItem(
        "usuario",
        JSON.stringify(
          usuarioAtualizado
        )
      );

      setMensagem(
        "Perfil atualizado com sucesso!"
      );

      setEditando(false);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setErro(error.message);
    }
  }

  function formatarData(data) {
    if (!data)
      return "Não informado";

    return new Date(
      data
    ).toLocaleDateString(
      "pt-BR"
    );
  }

  /* ==========================
     NOVAS ESTATÍSTICAS STEAM
  ========================== */

  const horasTotais =
    biblioteca.reduce(
      (acc, jogo) =>
        acc +
        (jogo.horasJogadas || 0),
      0
    );

  const jogoFavorito =
    biblioteca.length > 0
      ? [...biblioteca].sort(
          (a, b) =>
            (b.horasJogadas || 0) -
            (a.horasJogadas || 0)
        )[0]
      : null;

  const jogosRecentes =
    [...biblioteca]
      .sort(
        (a, b) =>
          new Date(
            b.ultimaVez || 0
          ) -
          new Date(
            a.ultimaVez || 0
          )
      )
      .slice(0, 4);

  if (!usuario) {
    return (
      <div className="perfil-container">
        <div className="perfil-card">
          <p>
            Usuário não encontrado.
          </p>
        </div>
      </div>
    );
  }

  function renderConteudo() {
        if (loading) {
      return (
        <div className="loading-spinner">
          Carregando dados...
        </div>
      );
    }

    switch (ativos) {
      case "biblioteca":
        return (
          <div className="biblioteca-grid">
            {biblioteca.length > 0 ? (
              biblioteca.map((jogo) => (
                <div
                  key={jogo.id}
                  className="biblioteca-item"
                >
                  <img
                    src={jogo.capaUrl}
                    alt={jogo.titulo}
                  />

                  <div className="biblioteca-info">
                    <h4>
                      {jogo.titulo}
                    </h4>

                    <p>
                      {jogo.horasJogadas || 0}
                      h jogadas
                    </p>

                    <span>
                      Última atividade:{" "}
                      {formatarData(
                        jogo.ultimaVez
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  📚 Sua biblioteca está vazia
                </p>

                <small>
                  Compre jogos para vê-los
                  aqui
                </small>
              </div>
            )}
          </div>
        );

      case "wishlist":
        return (
          <div className="wishlist-grid">
            {wishlist.length > 0 ? (
              wishlist.map((jogo) => (
                <div
                  key={jogo.id}
                  className="wishlist-item"
                >
                  <img
                    src={jogo.capaUrl}
                    alt={jogo.titulo}
                  />

                  <div className="wishlist-info">
                    <h4>
                      {jogo.titulo}
                    </h4>

                    <p>
                      {Number(
                        jogo.preco || 0
                      ).toLocaleString(
                        "pt-BR",
                        {
                          style:
                            "currency",
                          currency:
                            "BRL",
                        }
                      )}
                    </p>

                    <button className="btn-comprar">
                      Comprar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  ❤️ Nenhum jogo na
                  wishlist
                </p>

                <small>
                  Adicione jogos para
                  comprar depois
                </small>
              </div>
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="review-item"
                >
                  <div className="review-header">
                    <span className="review-rating">
                      ⭐{" "}
                      {review.nota ||
                        5}
                      /5
                    </span>

                    <span className="review-date">
                      {formatarData(
                        review.createdAt
                      )}
                    </span>
                  </div>

                  <p>
                    {review.comentario ||
                      "Sem comentário."}
                  </p>

                  <small>
                    Review publicada
                    pelo usuário
                  </small>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  ✍️ Nenhuma review
                  encontrada
                </p>

                <small>
                  Avalie jogos para
                  vê-las aqui
                </small>
              </div>
            )}
          </div>
        );

      case "conquistas":
        return (
          <div className="conquistas-grid">
            {conquistas.length > 0 ? (
              conquistas.map(
                (conquista) => (
                  <div
                    key={
                      conquista.id
                    }
                    className="conquista-item"
                  >
                    <div className="conquista-icon">
                      🏆
                    </div>

                    <div className="conquista-info">
                      <h4>
                        {conquista.nome ||
                          "Conquista"}
                      </h4>

                      <p>
                        {conquista.descricao ||
                          "Conquista desbloqueada"}
                      </p>

                      <small>
                        {formatarData(
                          conquista.desbloqueadoEm
                        )}
                      </small>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="empty-state">
                <p>
                  🎮 Nenhuma conquista
                </p>

                <small>
                  Continue jogando
                </small>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }
  return (
  <div className="perfil-container">

    <div className="perfil-card">

      {/* BANNER */}

      <div className="perfil-banner">

        <img
          className="perfil-banner-img"
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420"
          alt=""
        />

        <div className="perfil-overlay">

          <div className="avatar-container">

            <img
              src={
                avatar ||
                usuario.avatar ||
                `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(
                  usuario.nome
                )}`
              }
              alt={usuario.nome}
            />

            {editando && (
              <div className="avatar-edit">

                <input
                  type="text"
                  placeholder="URL do avatar"
                  value={avatar}
                  onChange={(e) =>
                    setAvatar(
                      e.target.value
                    )
                  }
                />

              </div>
            )}

          </div>

          <div className="perfil-banner-info">

            {editando ? (
              <input
                type="text"
                value={nome}
                onChange={(e) =>
                  setNome(
                    e.target.value
                  )
                }
                className="edit-nome"
              />
            ) : (
              <h1>{nome}</h1>
            )}

            <div className="steam-level">
              Level{" "}
              {usuario.steamLevel ||
                1}
            </div>

            <p className="member-since">
              Membro desde{" "}
              {formatarData(
                usuario.memberSince ||
                  usuario.createdAt
              )}
            </p>

          </div>

        </div>

      </div>

      {/* BIO */}

      <div className="perfil-bio">

        <h3>Sobre Mim</h3>

        {editando ? (
          <textarea
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }
            rows={4}
          />
        ) : (
          <p>
            {bio ||
              "Nenhuma biografia adicionada."}
          </p>
        )}

      </div>

      {/* STATS */}

      <div className="perfil-stats">

        <div className="stat-card">
          <span className="stat-value">
            {horasTotais}
          </span>

          <span className="stat-label">
            Horas Jogadas
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-value">
            {biblioteca.length}
          </span>

          <span className="stat-label">
            Jogos
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-value">
            {reviews.length}
          </span>

          <span className="stat-label">
            Reviews
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-value">
            {conquistas.length}
          </span>

          <span className="stat-label">
            Conquistas
          </span>
        </div>

      </div>

      {/* FAVORITO + ATIVIDADE */}

      <div className="perfil-extra-grid">

        <div className="favorite-game-card">

          <h3>
            ⭐ Jogo Favorito
          </h3>

          {jogoFavorito ? (
            <>
              <img
                src={
                  jogoFavorito.capaUrl
                }
                alt={
                  jogoFavorito.titulo
                }
              />

              <h4>
                {
                  jogoFavorito.titulo
                }
              </h4>

              <p>
                {
                  jogoFavorito.horasJogadas
                }
                h jogadas
              </p>
            </>
          ) : (
            <p>
              Nenhum jogo
              encontrado.
            </p>
          )}

        </div>

        <div className="activity-card">

          <h3>
            🔥 Atividade Recente
          </h3>

          {jogosRecentes.length >
          0 ? (
            jogosRecentes.map(
              (jogo) => (
                <div
                  key={jogo.id}
                  className="activity-item"
                >
                  <span>
                    Jogou{" "}
                    {
                      jogo.titulo
                    }
                  </span>

                  <small>
                    {formatarData(
                      jogo.ultimaVez
                    )}
                  </small>
                </div>
              )
            )
          ) : (
            <p>
              Nenhuma
              atividade
              recente.
            </p>
          )}

        </div>

      </div>

      {/* TABS */}

      <div className="perfil-tabs">

        <button
          className={
            ativos ===
            "biblioteca"
              ? "tab-active"
              : "tab"
          }
          onClick={() =>
            setAtivos(
              "biblioteca"
            )
          }
        >
          📚 Biblioteca
        </button>

        <button
          className={
            ativos ===
            "wishlist"
              ? "tab-active"
              : "tab"
          }
          onClick={() =>
            setAtivos(
              "wishlist"
            )
          }
        >
          ❤️ Wishlist
        </button>

        <button
          className={
            ativos ===
            "reviews"
              ? "tab-active"
              : "tab"
          }
          onClick={() =>
            setAtivos(
              "reviews"
            )
          }
        >
          ✍️ Reviews
        </button>

        <button
          className={
            ativos ===
            "conquistas"
              ? "tab-active"
              : "tab"
          }
          onClick={() =>
            setAtivos(
              "conquistas"
            )
          }
        >
          🏆 Conquistas
        </button>

      </div>

      {/* CONTEÚDO */}

      <div className="perfil-conteudo">
        {renderConteudo()}
      </div>

      {/* ALERTAS */}

      {mensagem && (
        <div className="mensagem-sucesso">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mensagem-erro">
          {erro}
        </div>
      )}

      {/* BOTÕES */}

      <div className="perfil-actions">

        {editando ? (
          <>
            <button
              onClick={
                handleSalvar
              }
              className="btn-salvar"
            >
              Salvar
            </button>

            <button
              onClick={
                handleCancelar
              }
              className="btn-cancelar"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={
              handleEditar
            }
            className="btn-editar"
          >
            Editar Perfil
          </button>
        )}

        <button
          onClick={logout}
          className="btn-logout"
        >
          Sair da Conta
        </button>

      </div>

    </div>

  </div>
);
}