import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CardPrincipal from "./components/CardPrincipal";
import Header from "./components/Header";
import CardsPromocoes from "./components/CardsPromocoes";
import DetalheJogo from "./components/DetalhesJogo";
import PopupPromocao from "./components/PopupPromocao";
import ExploreCategorias from "./components/ExploreCategorias";
import Login from "./components/Login";
import PerfilUsuario from "./components/PerfilUsuario";
import API from "./services/api";
import Biblioteca from "./components/Biblioteca";

function AppContent() {
  const [jogos, setJogos] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { usuario } = useAuth();

  const podeMostrarPopup =
    usuario &&
    location.pathname === "/";

  useEffect(() => {
    async function carregarJogos() {
      try {
        const res = await fetch(`${API}/jogos`);
        const data = await res.json();

        const jogosComImagens = await Promise.all(
          (data.itens || []).map(async (jogo) => {
            try {
              const imagensRes = await fetch(
                `${API}/jogos/${jogo.id}/imagens`
              );
              const imagens = await imagensRes.json();

              return {
                ...jogo,
                imagens: imagens || [],
              };
            } catch {
              return {
                ...jogo,
                imagens: [],
              };
            }
          })
        );

        setJogos(jogosComImagens);
        setLoading(false);
      } catch (err) {
        console.log("ERRO API:", err);
        setLoading(false);
      }
    }

    carregarJogos();
  }, []);

  function proximoJogo() {
    if (indexAtual < jogos.length - 1) {
      setIndexAtual(indexAtual + 1);
    }
  }

  function voltarJogo() {
    if (indexAtual > 0) {
      setIndexAtual(indexAtual - 1);
    }
  }

  if (loading) {
    return (
      <div>
        <Header jogos={jogos} />

        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "#fff",
          }}
        >
          Carregando jogos...
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header jogos={jogos} />

      {podeMostrarPopup && jogos.length > 0 && (
        <PopupPromocao jogos={jogos} />
      )}

      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                {jogos.length > 0 && (
                  <CardPrincipal
                    jogo={jogos[indexAtual]}
                    proximoJogo={proximoJogo}
                    voltarJogo={voltarJogo}
                  />
                )}

                <CardsPromocoes jogos={jogos} />

                <ExploreCategorias />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/jogo/:id"
          element={
            <ProtectedRoute>
              <DetalheJogo jogos={jogos} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilUsuario />
            </ProtectedRoute>
          }
        />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Biblioteca />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export default App;