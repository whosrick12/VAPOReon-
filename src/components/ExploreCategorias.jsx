import "../CSS/ExploreCategorias.css";

export default function ExploreCategorias() {

  return (

    <section className="categorias-home">

      <h2>Explore por Categorias</h2>

      <div className="categorias-grid">

        <div className="categoria-card">
          <img src="/categorias/acao.jpg" alt="" />
          <span>Ação</span>
        </div>

        <div className="categoria-card">
          <img src="/categorias/rpg.jpg" alt="" />
          <span>RPG</span>
        </div>

        <div className="categoria-card">
          <img src="/categorias/aventura.jpg" alt="" />
          <span>Aventura</span>
        </div>

        <div className="categoria-card">
          <img src="/categorias/estrategia.jpg" alt="" />
          <span>Estratégia</span>
        </div>

        <div className="categoria-card">
          <img src="/categorias/coop.jpg" alt="" />
          <span>Cooperativo</span>
        </div>

      </div>

    </section>

  );

}