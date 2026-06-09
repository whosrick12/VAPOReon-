import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");
    
    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  async function login(matricula, senha) {
    console.log("=== LOGIN DEBUG ===");
    console.log("Enviando para API:", `${API}/auth/login`);
    console.log("Dados:", { matricula, senha });
    
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ matricula, senha }),
      });

      console.log("Status da resposta:", response.status);
      
      const data = await response.json();
      console.log("Resposta da API:", data);

      if (!response.ok) {
        throw new Error(data.message || "Matrícula ou senha inválidos");
      }

      const usuarioData = {
        id: data.usuario?.id || data.id,
        matricula: data.usuario?.matricula || data.matricula,
        nome: data.usuario?.nome || data.nome,
        email: data.usuario?.email || data.email,
        avatar: `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(data.usuario?.nome || data.nome)}`,
        level: data.usuario?.level || 1,
      };

      const tokenRecebido = data.token || data.accessToken;

      console.log("Usuário processado:", usuarioData);
      console.log("Token:", tokenRecebido);

      setToken(tokenRecebido);
      setUsuario(usuarioData);
      localStorage.setItem("token", tokenRecebido);
      localStorage.setItem("usuario", JSON.stringify(usuarioData));

      return usuarioData;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  function logout() {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}