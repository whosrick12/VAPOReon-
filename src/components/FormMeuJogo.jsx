import { useState, useEffect } from "react";
import { criarJogo, atualizarJogo, listarGeneros, listarImagens, adicionarImagem, removerImagem } from "../services/meusJogosService";
import "../CSS/meusJogos.css";

export default function FormMeuJogo({ jogo, onClose, token, onSave }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    desenvolvedora: "",
    lancamento: "",
    capaUrl: "",
    generoIds: [],
  });
  
  const [generos, setGeneros] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [novaImagem, setNovaImagem] = useState({ url: "", legenda: "", ordem: 0 });

  const isEditando = !!jogo;

  useEffect(() => {
    carregarGeneros();
    if (isEditando) {
      setFormData({
        titulo: jogo.titulo || "",
        descricao: jogo.descricao || "",
        preco: jogo.preco || "",
        desenvolvedora: jogo.desenvolvedora || "",
        lancamento: jogo.lancamento ? jogo.lancamento.split("T")[0] : "",
        capaUrl: jogo.capaUrl || "",
        generoIds: jogo.generos?.map(g => g.id) || [],
      });
      carregarImagens();
    }
  }, [jogo]);

  async function carregarGeneros() {
    try {
      const data = await listarGeneros();
      setGeneros(data.itens || data || []);
    } catch (error) {
      console.error("Erro ao carregar gêneros:", error);
    }
  }

  async function carregarImagens() {
    if (!jogo?.id) return;
    try {
      const data = await listarImagens(jogo.id, token);
      setImagens(data);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleGeneroChange(e) {
    const options = e.target.options;
    const selectedIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(parseInt(options[i].value));
      }
    }
    setFormData(prev => ({ ...prev, generoIds: selectedIds }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const dadosParaEnviar = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        desenvolvedora: formData.desenvolvedora,
        lancamento: formData.lancamento ? formData.lancamento + "T00:00:00.000Z" : new Date().toISOString(),
        capaUrl: formData.capaUrl || "https://placehold.co/600x400",
        generoIds: formData.generoIds
      };
      
      if (isEditando) {
        await atualizarJogo(jogo.id, dadosParaEnviar, token);
      } else {
        await criarJogo(dadosParaEnviar, token);
      }
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddImagem(e) {
    e.preventDefault();
    if (!novaImagem.url) return;
    
    try {
      await adicionarImagem(jogo.id, novaImagem, token);
      setNovaImagem({ url: "", legenda: "", ordem: 0 });
      carregarImagens();
      if (onSave) onSave();
    } catch (error) {
      alert("Erro ao adicionar imagem: " + error.message);
    }
  }

  async function handleRemoveImagem(imagemId) {
    try {
      await removerImagem(jogo.id, imagemId, token);
      carregarImagens();
      if (onSave) onSave();
    } catch (error) {
      alert("Erro ao remover imagem: " + error.message);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <div className="modal-header">
          <h2>{isEditando ? "Editar Jogo" : "Criar Novo Jogo"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="meu-jogo-form">
          <div className="form-row">
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Meu Jogo Incrível"
              />
            </div>

            <div className="form-group">
              <label>Preço *</label>
              <input
                type="number"
                step="0.01"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Desenvolvedora</label>
              <input
                type="text"
                name="desenvolvedora"
                value={formData.desenvolvedora}
                onChange={handleChange}
                placeholder="Nome do estúdio"
              />
            </div>

            <div className="form-group">
              <label>Data de Lançamento</label>
              <input
                type="date"
                name="lancamento"
                value={formData.lancamento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL da Capa</label>
            <input
              type="text"
              name="capaUrl"
              value={formData.capaUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
            {formData.capaUrl && (
              <div className="capa-preview">
                <img src={formData.capaUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
              placeholder="Descreva seu jogo..."
            />
          </div>

          <div className="form-group">
            <label>Gêneros</label>
            <select
              multiple
              value={formData.generoIds}
              onChange={handleGeneroChange}
              className="generos-select"
            >
              {generos.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.nome}
                </option>
              ))}
            </select>
            <small>Segure Ctrl para selecionar múltiplos</small>
          </div>

          {isEditando && (
            <div className="imagens-section">
              <h3>Imagens do Jogo</h3>
              
              <div className="add-imagem">
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={novaImagem.url}
                  onChange={(e) => setNovaImagem({ ...novaImagem, url: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Legenda"
                  value={novaImagem.legenda}
                  onChange={(e) => setNovaImagem({ ...novaImagem, legenda: e.target.value })}
                />
                <button onClick={handleAddImagem}>+ Adicionar</button>
              </div>

              <div className="imagens-grid">
                {imagens.map((img) => (
                  <div key={img.id} className="imagem-item">
                    <img src={img.url} alt={img.legenda} />
                    <p>{img.legenda || "Sem legenda"}</p>
                    <button onClick={() => handleRemoveImagem(img.id)}>🗑️ Remover</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Salvando..." : (isEditando ? "Atualizar" : "Criar Jogo")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}