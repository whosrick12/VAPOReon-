// src/services/jogosService.js
import API from "./api";

// Buscar todos os jogos da API
export async function getTodosJogos() {
  try {
    console.log("Buscando jogos da API em:", `${API}/jogos`);
    const response = await fetch(`${API}/jogos`);
    const data = await response.json();
    
    console.log("Resposta completa da API /jogos:", data);
    console.log("Estrutura da resposta:", Object.keys(data));
    
    // Verifica diferentes estruturas possíveis
    let jogos = [];
    if (data.itens && Array.isArray(data.itens)) {
      jogos = data.itens;
    } else if (data.jogos && Array.isArray(data.jogos)) {
      jogos = data.jogos;
    } else if (Array.isArray(data)) {
      jogos = data;
    } else if (data.data && Array.isArray(data.data)) {
      jogos = data.data;
    } else {
      console.warn("Estrutura de dados não reconhecida:", data);
      jogos = [];
    }
    
    console.log("Jogos extraídos:", jogos);
    console.log("Quantidade de jogos:", jogos.length);
    
    return jogos;
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return [];
  }
}

// Buscar jogos por categoria
export async function getJogosPorCategoria(categoria) {
  try {
    console.log(`=== BUSCANDO JOGOS DA CATEGORIA: ${categoria} ===`);
    
    // Primeiro busca todos os jogos
    const todosJogos = await getTodosJogos();
    console.log("Total de jogos encontrados:", todosJogos.length);
    
    if (todosJogos.length === 0) {
      console.warn("Nenhum jogo encontrado na API!");
      return [];
    }
    
    // Mapeamento de categorias para palavras-chave
    const categoriaMap = {
      acao: ["ação", "acao", "action", "aventura", "luta"],
      rpg: ["rpg", "role-playing", "role playing"],
      aventura: ["aventura", "adventure", "história"],
      estrategia: ["estratégia", "estrategia", "strategy"],
      coop: ["coop", "cooperativo", "multiplayer", "multijogador"]
    };
    
    const palavrasChave = categoriaMap[categoria] || [categoria];
    console.log("Palavras-chave para buscar:", palavrasChave);
    
    // Filtra os jogos
    const jogosFiltrados = todosJogos.filter(jogo => {
      // Verifica em quais campos buscar
      const genero = (jogo.genero || jogo.categoria || jogo.tags || "").toLowerCase();
      const titulo = (jogo.titulo || jogo.nome || "").toLowerCase();
      const descricao = (jogo.descricao || jogo.sinopse || "").toLowerCase();
      
      const corresponde = palavrasChave.some(palavra => 
        genero.includes(palavra) || 
        titulo.includes(palavra) || 
        descricao.includes(palavra)
      );
      
      if (corresponde) {
        console.log(`Jogo encontrado: ${jogo.titulo} - Gênero: ${genero}`);
      }
      
      return corresponde;
    });
    
    console.log(`Total de jogos na categoria ${categoria}:`, jogosFiltrados.length);
    console.log("Jogos filtrados:", jogosFiltrados);
    
    // Busca imagens para cada jogo
    const jogosComImagens = await Promise.all(
      jogosFiltrados.map(async (jogo) => {
        try {
          const imagensRes = await fetch(`${API}/jogos/${jogo.id}/imagens`);
          const imagens = await imagensRes.json();
          return {
            ...jogo,
            imagens: imagens || [],
            capaUrl: jogo.capaUrl || jogo.imagem || "https://via.placeholder.com/300x200/1a6eff/white?text=Sem+Imagem"
          };
        } catch {
          return {
            ...jogo,
            imagens: [],
            capaUrl: jogo.capaUrl || "https://via.placeholder.com/300x200/1a6eff/white?text=Sem+Imagem"
          };
        }
      })
    );
    
    return jogosComImagens;
  } catch (error) {
    console.error(`Erro ao buscar jogos da categoria ${categoria}:`, error);
    return [];
  }
}

// Buscar jogo por ID
export async function getJogoPorId(id) {
  try {
    const response = await fetch(`${API}/jogos/${id}`);
    const jogo = await response.json();
    
    try {
      const imagensRes = await fetch(`${API}/jogos/${id}/imagens`);
      const imagens = await imagensRes.json();
      jogo.imagens = imagens || [];
    } catch {
      jogo.imagens = [];
    }
    
    return jogo;
  } catch (error) {
    console.error(`Erro ao buscar jogo ${id}:`, error);
    return null;
  }
}