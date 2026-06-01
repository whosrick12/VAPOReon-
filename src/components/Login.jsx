import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../CSS/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const emailLimpo = email.trim();
    const senhaLimpa = senha.trim();

    console.log("Login.jsx - tentando com:", emailLimpo, senhaLimpa);

    try {
      await login(emailLimpo, senhaLimpa);
      console.log("Login.jsx - sucesso, navegando para /");
      navigate("/");
    } catch (error) {
      console.error("Login.jsx - erro:", error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>

        <div className="demo-accounts">
          <p>Contas de demonstração:</p>
          <span>aasasas@gmail.com / 123123123</span>
          <span>ricardo@email.com / 123456</span>
          <span>admin@email.com / admin123</span>
        </div>
      </div>
    </div>
  );
}