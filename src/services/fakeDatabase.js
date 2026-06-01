const STORAGE_KEY = "fake_auth_db";

const DEFAULT_USERS = [
  {
    id: 1,
    nome: "Ricardo Almeida",
    email: "ricardo@email.com",
    senha: "123456",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Amante de jogos souls-like e RPGs. Jogando há mais de 10 anos!",
    steamLevel: 98,
    memberSince: "2020-01-15",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    nome: "Admin Sistema",
    email: "admin@email.com",
    senha: "admin123",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "Administrador da plataforma",
    steamLevel: 100,
    memberSince: "2019-01-01",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    nome: "Maria Silva",
    email: "maria@email.com",
    senha: "123456",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Gamer casual, adoro jogos indie e aventura",
    steamLevel: 45,
    memberSince: "2021-06-20",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    nome: "João Santos",
    email: "joao@email.com",
    senha: "123456",
    avatar: "https://i.pravatar.cc/150?img=4",
    bio: "Competitivo, foco em FPS e estratégia",
    steamLevel: 32,
    memberSince: "2022-03-10",
    createdAt: new Date().toISOString()
  }
];

export function initDatabase() {
  const db = localStorage.getItem(STORAGE_KEY);
  if (!db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(db);
}

export function getUsers() {
  const users = localStorage.getItem(STORAGE_KEY);
  if (!users) {
    return initDatabase();
  }
  return JSON.parse(users);
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function createUser(userData) {
  const users = getUsers();
  
  const emailExiste = users.some(u => u.email === userData.email);
  if (emailExiste) {
    throw new Error("Este email já está cadastrado");
  }
  
  if (userData.senha.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres");
  }
  
  const newUser = {
    id: Date.now(),
    nome: userData.nome,
    email: userData.email,
    senha: userData.senha,
    avatar: `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(userData.nome)}`,
    bio: "",
    steamLevel: 1,
    memberSince: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  console.log("Usuário criado com sucesso:", newUser.email);
  console.log("Total de usuários no banco:", users.length);
  
  const { senha, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export function loginUser(email, senha) {
  const users = getUsers();
  console.log("Tentando login com:", email);
  console.log("Usuários no banco:", users.map(u => ({ email: u.email, senha: u.senha })));
  
  const user = users.find(u => u.email === email && u.senha === senha);
  
  if (!user) {
    console.log("Usuário não encontrado ou senha incorreta");
    throw new Error("Email ou senha inválidos");
  }
  
  console.log("Login bem-sucedido:", user.email);
  
  const token = btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    exp: Date.now() + 24 * 60 * 60 * 1000
  }));
  
  const { senha: _, ...userWithoutPassword } = user;
  
  return {
    token,
    usuario: userWithoutPassword
  };
}

export function validateToken(token) {
  if (!token) return false;
  
  try {
    const decoded = JSON.parse(atob(token));
    const isExpired = decoded.exp < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
}

export function updateUser(userId, updatedData) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error("Usuário não encontrado");
  }
  
  users[userIndex] = {
    ...users[userIndex],
    nome: updatedData.nome || users[userIndex].nome,
    avatar: updatedData.avatar || users[userIndex].avatar,
    bio: updatedData.bio || users[userIndex].bio,
    steamLevel: updatedData.steamLevel || users[userIndex].steamLevel,
  };
  
  saveUsers(users);
  
  const { senha, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
}

export function getUserGames(userId) {
  const gamesKey = `user_games_${userId}`;
  const savedGames = localStorage.getItem(gamesKey);
  
  if (savedGames) {
    return JSON.parse(savedGames);
  }
  
  const defaultGames = [
    {
      id: 68,
      titulo: "Sekiro: Shadows Die Twice",
      capaUrl: "https://res.cloudinary.com/dkubafbx4/image/upload/v1780263206/Sekiro_pdh8sn.jpg",
      horasJogadas: 45,
      ultimaVez: new Date().toISOString(),
      conquistas: 12
    },
    {
      id: 67,
      titulo: "Ghost of Tsushima",
      capaUrl: "https://res.cloudinary.com/dkubafbx4/image/upload/f_auto,q_auto/GhostOfTsushima_rf2wbo",
      horasJogadas: 28,
      ultimaVez: new Date().toISOString(),
      conquistas: 8
    }
  ];
  
  localStorage.setItem(gamesKey, JSON.stringify(defaultGames));
  return defaultGames;
}