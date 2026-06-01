import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser, loginUser } from "../services/fakeDatabase";
import { useAuth } from "../contexts/AuthContext";
import "../CSS/register.css";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    // Validar senhas
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Criar usuário
      const novoUsuario = createUser({ nome, email, senha });
      
      // Fazer login automático
      const { token, usuario } = loginUser(email, senha);
      
      // Salvar no contexto
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      
      // Recarregar a página para atualizar o contexto
      window.location.href = "/";
      
    } catch (error) {
      setErro(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Criar conta</h1>
          <p>Cadastre-se para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <label>Nome completo</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirmar senha</label>
            <input
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <div className="register-footer">
          <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
        </div>
      </div>
    </div>
  );
}