// services/favoritosLocalService.js

const STORAGE_KEY = "favoritos_db";

function getFavoritosStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {};
  }
  return JSON.parse(data);
}

function saveFavoritosStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getFavoritos(matricula) {
  const allFavoritos = getFavoritosStorage();
  return allFavoritos[matricula] || [];
}

export function addFavorito(matricula, jogoId, jogo) {
  const allFavoritos = getFavoritosStorage();
  
  if (!allFavoritos[matricula]) {
    allFavoritos[matricula] = [];
  }
  
  const jaExiste = allFavoritos[matricula].some(f => f.id === jogoId || f.jogoId === jogoId);
  
  if (jaExiste) {
    throw new Error("Jogo já está nos favoritos");
  }
  
  allFavoritos[matricula].push({
    id: jogoId,
    jogoId: jogoId,
    jogo: jogo,
    favoritadoEm: new Date().toISOString()
  });
  
  saveFavoritosStorage(allFavoritos);
  return allFavoritos[matricula];
}

export function removeFavorito(matricula, jogoId) {
  const allFavoritos = getFavoritosStorage();
  
  if (allFavoritos[matricula]) {
    allFavoritos[matricula] = allFavoritos[matricula].filter(
      f => f.jogoId !== jogoId && f.id !== jogoId
    );
    
    saveFavoritosStorage(allFavoritos);
  }
  
  return true;
}

export function isFavorito(matricula, jogoId) {
  const favoritos = getFavoritos(matricula);
  return favoritos.some(f => f.jogoId === jogoId || f.id === jogoId);
}

// Função para buscar dados completos dos jogos favoritados
export function getFavoritosCompletos(matricula, bibliotecaCompleta) {
  const favoritos = getFavoritos(matricula);
  const jogosFavoritados = favoritos.map(fav => {
    // Tenta encontrar o jogo na biblioteca do usuário
    const jogoDaBiblioteca = bibliotecaCompleta.find(jogo => jogo.id === fav.jogoId);
    // Se encontrar na biblioteca, usa os dados atualizados, senão usa os dados salvos no favorito
    return jogoDaBiblioteca || fav.jogo;
  });
  return jogosFavoritados;
}