import API from "./api";

export async function listarMeusJogos(token, usuarioId, pagina = 1, limite = 20) {
  try {
    const response = await fetch(`${API}/jogos?pagina=${pagina}&limite=${limite}`, {
      headers: {
        "token": `${token}`,
      },
    });
    
    if (!response.ok) throw new Error("Erro ao buscar jogos");
    
    const data = await response.json();
    
    const meusJogos = {
      ...data,
      itens: data.itens.filter(jogo => jogo.autor?.id === usuarioId)
    };
    
    meusJogos.total = meusJogos.itens.length;
    meusJogos.paginas = Math.ceil(meusJogos.total / limite);
    
    return meusJogos;
  } catch (error) {
    console.error("Erro listarMeusJogos:", error);
    throw error;
  }
}

export async function criarJogo(jogo, token) {
  try {
    const response = await fetch(`${API}/jogos`, {
      method: "POST",
      headers: {
        "token": `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jogo),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || error.message || "Erro ao criar jogo");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro criarJogo:", error);
    throw error;
  }
}

export async function atualizarJogo(id, jogo, token) {
  try {
    const response = await fetch(`${API}/jogos/${id}`, {
      method: "PUT",
      headers: {
        "token": `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jogo),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || error.message || "Erro ao atualizar jogo");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro atualizarJogo:", error);
    throw error;
  }
}

export async function deletarJogo(id, token) {
  try {
    const response = await fetch(`${API}/jogos/${id}`, {
      method: "DELETE",
      headers: {
        "token": `${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || error.message || "Erro ao deletar jogo");
    }
    return true;
  } catch (error) {
    console.error("Erro deletarJogo:", error);
    throw error;
  }
}

export async function buscarJogo(id, token) {
  try {
    const response = await fetch(`${API}/jogos/${id}`, {
      headers: {
        "token": `${token}`,
      },
    });
    
    if (!response.ok) throw new Error("Erro ao buscar jogo");
    return await response.json();
  } catch (error) {
    console.error("Erro buscarJogo:", error);
    throw error;
  }
}

export async function listarGeneros() {
  try {
    const response = await fetch(`${API}/generos`);
    if (!response.ok) throw new Error("Erro ao listar gêneros");
    return await response.json();
  } catch (error) {
    console.error("Erro listarGeneros:", error);
    return [];
  }
}

export async function listarImagens(jogoId, token) {
  try {
    const response = await fetch(`${API}/jogos/${jogoId}/imagens`, {
      headers: {
        "token": `${token}`,
      },
    });
    if (!response.ok) throw new Error("Erro ao listar imagens");
    return await response.json();
  } catch (error) {
    console.error("Erro listarImagens:", error);
    return [];
  }
}

export async function adicionarImagem(jogoId, imagem, token) {
  try {
    const response = await fetch(`${API}/jogos/${jogoId}/imagens`, {
      method: "POST",
      headers: {
        "token": `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imagem),
    });
    
    if (!response.ok) throw new Error("Erro ao adicionar imagem");
    return await response.json();
  } catch (error) {
    console.error("Erro adicionarImagem:", error);
    throw error;
  }
}

export async function removerImagem(jogoId, imagemId, token) {
  try {
    const response = await fetch(`${API}/jogos/${jogoId}/imagens/${imagemId}`, {
      method: "DELETE",
      headers: {
        "token": `${token}`,
      },
    });
    
    if (!response.ok) throw new Error("Erro ao remover imagem");
    return true;
  } catch (error) {
    console.error("Erro removerImagem:", error);
    throw error;
  }
}