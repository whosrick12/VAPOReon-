// src/components/ExploreCategorias.jsx
import { useNavigate } from "react-router-dom";
import "../CSS/ExploreCategorias.css";

export default function ExploreCategorias() {
  const navigate = useNavigate();

  // Imagens hospedadas no Cloudinary
  const categorias = [
    { 
      id: "acao", 
      nome: "Ação", 
      imagem: "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580267/ghost_piv2at.jpg"
    },
    { 
      id: "rpg", 
      nome: "RPG", 
      imagem: "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580119/elden_pieqix.jpg"
    },
    { 
      id: "aventura", 
      nome: "Aventura", 
      imagem: "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580392/gowR_nhudcn.webp"
    },
    { 
      id: "terror", 
      nome: "Terror", 
      imagem: "https://res.cloudinary.com/dt1bbluxk/image/upload/v1781580266/re4_igldoy.png"
    }
  ];

  const handleCategoriaClick = (categoriaId) => {
    navigate(`/categoria/${categoriaId}`);
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
            <div 
              className="categoria-banner"
              style={{ backgroundImage: `url(${categoria.imagem})` }}
            >
              {/* Blur overlay estilo Steam */}
              <div className="categoria-blur-overlay"></div>
              
              {/* Texto do meio */}
              <div className="categoria-text-center">
                <span className="categoria-nome-grande">{categoria.nome}</span>
              </div>
              
              {/* Texto inferior (opcional, estilo Steam) */}
              <div className="categoria-text-bottom">
                <span>{categoria.nome}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}