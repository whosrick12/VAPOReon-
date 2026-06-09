import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../CSS/DetalhesJogo.css";

export default function DetalheJogo({ jogos }) {

  const { id } = useParams();

  const jogo = jogos.find(
    j => String(j.id) === id
  );

  const [midiaIndex, setMidiaIndex] = useState(0);

  // Estados para dados que podem vir de outras fontes
  const [desenvolvedor, setDesenvolvedor] = useState("");
  const [generoPrincipal, setGeneroPrincipal] = useState("");
  const [dataLancamento, setDataLancamento] = useState("");
  const [modoJogo, setModoJogo] = useState("");

  // Função auxiliar para formatar data (apenas ano)
  function formatarAno(dataString) {
    if (!dataString) return "Em breve";
    
    try {
      // Se for string como "2019"
      if (/^\d{4}$/.test(dataString)) {
        return dataString;
      }
      
      // Tenta criar um objeto Date para formatos ISO
      const data = new Date(dataString);
      
      // Verifica se é uma data válida
      if (!isNaN(data.getTime())) {
        return data.getFullYear().toString();
      }
      
      return "Em breve";
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Em breve";
    }
  }

  useEffect(() => {
    if (jogo) {
      console.log("=== DADOS COMPLETOS DO JOGO ===");
      console.log("Jogo:", jogo);
      console.log("ID do jogo:", jogo.id);
      console.log("Título:", jogo.titulo);
      
      // ===================================
      // DEBUG DO DESENVOLVEDOR
      // ===================================
      console.log("\n--- DEBUG DESENVOLVEDOR ---");
      console.log("Campo 'desenvolvedor' bruto:", jogo.desenvolvedor);
      console.log("Tipo do desenvolvedor:", typeof jogo.desenvolvedor);
      console.log("Todas as chaves do objeto jogo:", Object.keys(jogo));
      
      // Tenta diferentes formas de pegar o desenvolvedor
      let devNome = "Não informado";
      
      if (jogo.desenvolvedor) {
        if (typeof jogo.desenvolvedor === 'string') {
          devNome = jogo.desenvolvedor;
          console.log("✓ Desenvolvedor é string direta:", devNome);
        } else if (jogo.desenvolvedor.nome) {
          devNome = jogo.desenvolvedor.nome;
          console.log("✓ Desenvolvedor tem campo .nome:", devNome);
        } else if (jogo.desenvolvedor.name) {
          devNome = jogo.desenvolvedor.name;
          console.log("✓ Desenvolvedor tem campo .name:", devNome);
        } else {
          console.log("✗ Desenvolvedor é objeto mas não tem .nome nem .name");
          console.log("Conteúdo do objeto:", JSON.stringify(jogo.desenvolvedor));
          devNome = JSON.stringify(jogo.desenvolvedor);
        }
      } else if (jogo.desenvolvedorNome) {
        devNome = jogo.desenvolvedorNome;
        console.log("✓ Desenvolvedor no campo 'desenvolvedorNome':", devNome);
      } else if (jogo.dev) {
        devNome = jogo.dev;
        console.log("✓ Desenvolvedor no campo 'dev':", devNome);
      } else if (jogo.developer) {
        devNome = jogo.developer;
        console.log("✓ Desenvolvedor no campo 'developer':", devNome);
      } else if (jogo.estudio) {
        devNome = jogo.estudio;
        console.log("✓ Desenvolvedor no campo 'estudio':", devNome);
      } else if (jogo.estudioNome) {
        devNome = jogo.estudioNome;
        console.log("✓ Desenvolvedor no campo 'estudioNome':", devNome);
      } else {
        console.log("✗ Nenhum campo de desenvolvedor encontrado!");
        console.log("Campos disponíveis que podem conter o desenvolvedor:", 
          Object.keys(jogo).filter(key => 
            key.toLowerCase().includes('dev') || 
            key.toLowerCase().includes('estudio') || 
            key.toLowerCase().includes('studio') ||
            key.toLowerCase().includes('developer')
          )
        );
      }
      
      console.log("✅ Desenvolvedor final:", devNome);
      setDesenvolvedor(devNome);
      
      // ===================================
      // EXTRAIR GÊNERO
      // ===================================
      console.log("\n--- DEBUG GÊNERO ---");
      console.log("Campo 'generos':", jogo.generos);
      
      if (jogo.generos && jogo.generos.length > 0) {
        const primeiroGenero = jogo.generos[0];
        const generoNome = primeiroGenero.nome || primeiroGenero;
        console.log("✅ Gênero encontrado:", generoNome);
        setGeneroPrincipal(generoNome);
      } else if (jogo.genero) {
        console.log("✅ Gênero no campo 'genero':", jogo.genero);
        setGeneroPrincipal(jogo.genero);
      } else {
        console.log("⚠️ Nenhum gênero encontrado, usando padrão 'Ação'");
        setGeneroPrincipal("Ação");
      }
      
      // ===================================
      // FORMATAR DATA DE LANÇAMENTO (APENAS ANO)
      // ===================================
      console.log("\n--- DEBUG DATA ---");
      console.log("Campo 'dataLancamento' bruto:", jogo.dataLancamento);
      console.log("Campo 'lancamento' bruto:", jogo.lancamento);
      
      let anoFormatado = "Em breve";
      
      if (jogo.dataLancamento) {
        anoFormatado = formatarAno(jogo.dataLancamento);
        console.log("✅ Data extraída de 'dataLancamento':", anoFormatado);
      } else if (jogo.lancamento) {
        anoFormatado = formatarAno(jogo.lancamento);
        console.log("✅ Data extraída de 'lancamento':", anoFormatado);
      } else if (jogo.ano) {
        anoFormatado = formatarAno(jogo.ano);
        console.log("✅ Data extraída de 'ano':", anoFormatado);
      } else {
        console.log("⚠️ Nenhuma data encontrada");
      }
      
      setDataLancamento(anoFormatado);
      
      // ===================================
      // EXTRAIR MODO DE JOGO
      // ===================================
      console.log("\n--- DEBUG MODO DE JOGO ---");
      console.log("Campo 'modoJogo':", jogo.modoJogo);
      console.log("Campo 'multiplayer':", jogo.multiplayer);
      
      let modo = "Single Player";
      
      if (jogo.modoJogo) {
        modo = jogo.modoJogo;
        console.log("✅ Modo extraído de 'modoJogo':", modo);
      } else if (jogo.multiplayer !== undefined) {
        modo = jogo.multiplayer ? "Multiplayer" : "Single Player";
        console.log("✅ Modo extraído de 'multiplayer':", modo);
      } else if (jogo.modo) {
        modo = jogo.modo;
        console.log("✅ Modo extraído de 'modo':", modo);
      } else {
        console.log("⚠️ Nenhum modo encontrado, usando padrão 'Single Player'");
      }
      
      setModoJogo(modo);
      
      console.log("\n=== RESUMO FINAL ===");
      console.log("Desenvolvedor:", devNome);
      console.log("Gênero:", generoPrincipal);
      console.log("Ano:", anoFormatado);
      console.log("Modo:", modo);
      console.log("===================\n");
    }
  }, [jogo]);

  if (!jogo) {
    return (
      <h2 style={{ color: "#fff", padding: "40px" }}>
        Jogo não encontrado
      </h2>
    );
  }

  const imagensExtras =
    jogo.imagens?.map(i => i.url) || [];

  const midias = [
    { type: "image", url: jogo.capaUrl },
    ...imagensExtras.map(url => ({
      type: "image",
      url
    })),
    ...(jogo.videoUrl
      ? [{ type: "video", url: jogo.videoUrl }]
      : [])
  ];

  const midiaAtual = midias[midiaIndex];

  function next(e) {
    e.stopPropagation();

    if (midias.length <= 1) return;

    setMidiaIndex(prev =>
      prev === midias.length - 1
        ? 0
        : prev + 1
    );
  }

  function prev(e) {
    e.stopPropagation();

    if (midias.length <= 1) return;

    setMidiaIndex(prev =>
      prev === 0
        ? midias.length - 1
        : prev - 1
    );
  }

  // Função para calcular o preço original
  function getPrecoOriginal() {
    if (jogo.desconto && jogo.desconto > 0) {
      const precoOriginal = jogo.preco / (1 - jogo.desconto / 100);
      return precoOriginal.toFixed(2);
    }
    return (jogo.preco * 1.25).toFixed(2);
  }

  // Função para pegar o percentual de desconto
  function getPercentualDesconto() {
    if (jogo.desconto && jogo.desconto > 0) {
      return jogo.desconto;
    }
    return 25;
  }

  return (
    <div className="detalhe-page">

      <div
        className="hero-background"
        style={{
          backgroundImage: `url(${jogo.capaUrl})`
        }}
      >

        <div className="hero-overlay">

          <div className="detalhe-container">

            <h1 className="game-title">
              {jogo.titulo}
            </h1>

            <div className="detalhe-top">

              {/* ESQUERDA */}
              <div className="detalhe-media">

                <div className="media-box">

                  <button
                    type="button"
                    className="arrow left"
                    onClick={prev}
                  >
                    ❮
                  </button>

                  {
                    midiaAtual?.type === "video"
                      ? (
                        <video
                          key={midiaAtual.url}
                          controls
                          autoPlay
                          muted
                          src={midiaAtual.url}
                        />
                      )
                      : (
                        <img
                          key={midiaAtual.url}
                          src={midiaAtual.url}
                          alt={jogo.titulo}
                        />
                      )
                  }

                  <button
                    type="button"
                    className="arrow right"
                    onClick={next}
                  >
                    ❯
                  </button>

                </div>

                <div className="mini-gallery">

                  {midias.map((m, i) => (

                    <div
                      key={i}
                      className={
                        i === midiaIndex
                          ? "mini-thumb active"
                          : "mini-thumb"
                      }
                      onClick={() =>
                        setMidiaIndex(i)
                      }
                    >

                      {
                        m.type === "video"
                          ? (
                            <video
                              src={m.url}
                              muted
                            />
                          )
                          : (
                            <img
                              src={m.url}
                              alt=""
                            />
                          )
                      }

                    </div>

                  ))}

                </div>

                {/* SOBRE O JOGO */}
                <div className="section game-about">

                  <h2>Sobre este jogo</h2>

                  <p>
                    {jogo.sinopse || jogo.descricao || "Sem descrição disponível."}
                  </p>

                </div>

                {/* IDIOMAS */}
                <div className="section">

                  <h2>Idiomas Suportados</h2>

                  <div className="language-grid">
                    {jogo.idiomas && jogo.idiomas.length > 0 ? (
                      jogo.idiomas.map((idioma, index) => (
                        <div key={index}>
                          {idioma.icone || "🌐"} {idioma.nome || idioma}
                        </div>
                      ))
                    ) : (
                      <>
                        <div>🇧🇷 Português</div>
                        <div>🇺🇸 Inglês</div>
                        <div>🇪🇸 Espanhol</div>
                        <div>🇫🇷 Francês</div>
                        <div>🇩🇪 Alemão</div>
                        <div>🇯🇵 Japonês</div>
                      </>
                    )}
                  </div>

                </div>

                {/* REQUISITOS */}
                <div className="section">

                  <h2>Requisitos do Sistema</h2>

                  <div className="req-grid">
                    <div>
                      <h3>Mínimos</h3>
                      <ul>
                        {jogo.requisitosMinimos ? (
                          Object.entries(jogo.requisitosMinimos).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))
                        ) : (
                          <>
                            <li>SO: Windows 10</li>
                            <li>CPU: Intel i5</li>
                            <li>RAM: 8 GB</li>
                            <li>GPU: GTX 1050</li>
                            <li>Armazenamento: 20 GB</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3>Recomendados</h3>
                      <ul>
                        {jogo.requisitosRecomendados ? (
                          Object.entries(jogo.requisitosRecomendados).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))
                        ) : (
                          <>
                            <li>SO: Windows 11</li>
                            <li>CPU: Intel i7</li>
                            <li>RAM: 16 GB</li>
                            <li>GPU: RTX 3060</li>
                            <li>SSD recomendado</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                </div>

              </div>

              {/* DIREITA */}
              <div className="detalhe-info">

                <img
                  className="game-cover"
                  src={jogo.capaUrl}
                  alt={jogo.titulo}
                />

                <p className="desc">
                  {jogo.descricao || jogo.sinopse || "Sem descrição disponível."}
                </p>

                <div className="price-card">

                  <div className="discount-row">

                    <span className="discount">
                      -{getPercentualDesconto()}%
                    </span>

                    <div>

                      <small className="old-price">
                        R$ {getPrecoOriginal()}
                      </small>

                      <h2 className="new-price">
                        R$ {jogo.preco}
                      </h2>

                    </div>

                  </div>

                  <button className="buy">
                    🛒 Comprar
                  </button>

                </div>

                <div className="info-card">

                  <h3>Informações</h3>

                  <div className="info-item">
                    <span>Gênero</span>
                    <strong>{generoPrincipal}</strong>
                  </div>

                  <div className="info-item">
                    <span>Desenvolvedor</span>
                    <strong>{desenvolvedor}</strong>
                  </div>

                  <div className="info-item">
                    <span>Lançamento</span>
                    <strong>{dataLancamento}</strong>
                  </div>

                  <div className="info-item">
                    <span>Modo</span>
                    <strong>{modoJogo}</strong>
                  </div>

                </div>

                <div className="info-card">

                  <h3>Categoria/Gênero</h3>

                  <div className="tags">
                    {jogo.generos && jogo.generos.length > 0 ? (
                      jogo.generos.map((g, i) => (
                        <span key={i}>
                          {g.nome || g}
                        </span>
                      ))
                    ) : (
                      <>
                        <span>Ação</span>
                        <span>Aventura</span>
                        <span>Popular</span>
                      </>
                    )}
                  </div>

                </div>

                <div className="info-card">

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}