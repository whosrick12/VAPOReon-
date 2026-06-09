// src/components/ExploreCategorias.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../CSS/ExploreCategorias.css";

export default function ExploreCategorias() {
  const navigate = useNavigate();
  const [jogosPorCategoria, setJogosPorCategoria] = useState({
    acao: [],
    rpg: [],
    aventura: [],
    terror: [],
    coop: []
  });

  const categoriaToNomeGenero = {
    "acao": "Ação",
    "rpg": "RPG",
    "aventura": "Aventura",
    "terror": "Terror",
    "coop": "Cooperativo"
  };

  const categorias = [
    { id: "acao", nome: "Ação" },
    { id: "rpg", nome: "RPG" },
    { id: "aventura", nome: "Aventura" },
    { id: "terror", nome: "Terror" },
    { id: "coop", nome: "Cooperativo" }
  ];

  useEffect(() => {
    async function carregarJogosPorCategoria() {
      try {
        let todosJogos = [];
        let pagina = 1;
        let totalPaginas = 1;
        
        while (pagina <= totalPaginas) {
          const jogosRes = await fetch(`${API}/jogos?pagina=${pagina}&limite=100`);
          if (jogosRes.ok) {
            const data = await jogosRes.json();
            totalPaginas = data.paginas || 1;
            const jogosPagina = data.itens || [];
            todosJogos = [...todosJogos, ...jogosPagina];
          }
          pagina++;
        }

        // Organizar jogos por categoria (máximo 4 para o grid 2x2)
        const jogosPorCat = {
          acao: [],
          rpg: [],
          aventura: [],
          terror: [],
          coop: []
        };

        todosJogos.forEach(jogo => {
          if (jogo.generos && Array.isArray(jogo.generos)) {
            jogo.generos.forEach(genero => {
              const nomeGenero = genero.nome || genero.descricao;
              for (const [catId, catNome] of Object.entries(categoriaToNomeGenero)) {
                if (nomeGenero === catNome && jogosPorCat[catId].length < 4) {
                  jogosPorCat[catId].push(jogo);
                }
              }
            });
          }
        });

        setJogosPorCategoria(jogosPorCat);
      } catch (error) {
        console.error("Erro ao carregar jogos:", error);
      }
    }

    carregarJogosPorCategoria();
  }, []);

  const handleCategoriaClick = (categoriaId) => {
    navigate(`/categoria/${categoriaId}`);
  };

  // Função para criar o grid de miniaturas (2x2)
  const renderMiniaturas = (categoriaId) => {
    const jogos = jogosPorCategoria[categoriaId];
    const miniaturas = [];
    
    // Grid 2x2: posições 0,1 na primeira linha, 2,3 na segunda
    for (let i = 0; i < 4; i++) {
      const jogo = jogos[i];
      miniaturas.push(
        <div key={i} className="categoria-banner-item">
          {jogo ? (
            <img 
              src={jogo.capaUrl || "https://via.placeholder.com/150x150/1a6eff/white?text=Game"} 
              alt={jogo.titulo}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150x150/1a6eff/white?text=Game";
              }}
            />
          ) : (
            <div className="empty-placeholder">
              <span>🎮</span>
            </div>
          )}
        </div>
      );
    }
    
    return miniaturas;
  };

  return (
    <section className="categorias-home">
      <div className="categorias-header">
        <h2>Explore por Categorias</h2>
        <p>Descubra os melhores jogos por gênero</p>
      </div>
      
      <div className="categorias-grid">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="categoria-card"
            onClick={() => handleCategoriaClick(categoria.id)}
          >
            <div className="categoria-banner">
              <div className="categoria-banner-grid">
                {renderMiniaturas(categoria.id)}
              </div>
              <div className="categoria-overlay">
                <div className="categoria-nome">{categoria.nome}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}