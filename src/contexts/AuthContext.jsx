import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initDatabase, loginUser } from "../services/fakeDatabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initDatabase();
    
    const tokenSalvo = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");
    
    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    console.log("AuthContext.login chamado com:", email, senha);
    
    try {
      const result = loginUser(email, senha);
      console.log("Resultado do loginUser:", result);
      
      setToken(result.token);
      setUsuario(result.usuario);
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      
      console.log("Login realizado com sucesso!");
      return result.usuario;
    } catch (error) {
      console.error("Erro no AuthContext.login:", error);
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