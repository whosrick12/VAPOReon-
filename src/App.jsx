import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import CardPrincipal from "./components/CardPrincipal";
import Header from "./components/Header";
import CardsPromocoes from "./components/CardsPromocoes";
import DetalheJogo from "./components/DetalhesJogo";
import PopupPromocao from "./components/PopupPromocao";
import ExploreCategorias from "./components/ExploreCategorias";
import API from "./services/api";

function App() {

  const [jogos, setJogos] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);

  useEffect(() => {

    fetch(`${API}/jogos`)
      .then(res => res.json())
      .then(data => {

        console.log(data);

        setJogos(data.itens || []);

      })
      .catch(err => {
        console.log("ERRO API:", err);
      });

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

  return (

    <div>

      <Header />

      {/* POPUP PROMOÇÃO */}
      {jogos.length > 0 && (

        <PopupPromocao
          jogos={jogos}
        />

      )}

      <Routes>

        <Route
          path="/"
          element={
            <>

              {/* BANNER PRINCIPAL */}
              {jogos.length > 0 && (

                <CardPrincipal
                  jogo={jogos[indexAtual]}
                  proximoJogo={proximoJogo}
                  voltarJogo={voltarJogo}
                />

              )}

              {/* PROMOÇÕES */}
              <CardsPromocoes
                jogos={jogos}
              />

              {/* EXPLORE POR CATEGORIA */}
              <ExploreCategorias />

            </>
          }
        />

        <Route
          path="/jogo/:id"
          element={
            <DetalheJogo
              jogos={jogos}
            />
          }
        />

      </Routes>

    </div>

  );

}

export default App;