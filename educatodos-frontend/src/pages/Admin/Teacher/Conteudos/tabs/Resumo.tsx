import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DropzoneComponent from "../../../../../components/form/form-elements/DropZone";
import api from "../../../../../services/api";
import moment from "moment";

const categoriasAcessibilidade = ["Visual", "Auditiva", "Motora", "Intelectual"] as const;

export default function Resumo() {
  const { disciplinaId, id } = useParams();
  const navigate = useNavigate();
  const isEditando = id !== "cadastrar";

  const [abaAtiva, setAbaAtiva] = useState<(typeof categoriasAcessibilidade)[number]>("Visual");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFinalizacao, setDataFinalizacao] = useState("");

  const [resumoGeral, setResumoGeral] = useState("");
  const [resumoAcessibilidade, setResumoAcessibilidade] = useState<Record<string, string>>({
    Visual: "",
    Auditiva: "",
    Motora: "",
    Intelectual: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  // 🔥 Carregar dados na edição
  useEffect(() => {
    if (isEditando) {
      api.get(`/teacher/conteudos/${id}`).then((response) => {
        const conteudo = response.data.data;
        setTitulo(conteudo.title);
        setDescricao(conteudo.description);
        setDataInicio(moment(conteudo.start_date).format('YYYY-MM-DD'));
        setDataFinalizacao(moment(conteudo.end_date).format('YYYY-MM-DD'));
        setResumoGeral(conteudo.summary_text || "");

        setResumoAcessibilidade({
          Visual: conteudo.summary_visual || "",
          Auditiva: conteudo.summary_auditory || "",
          Motora: conteudo.summary_motor || "",
          Intelectual: conteudo.summary_intellectual || "",
        });
      });
    }
  }, [id, isEditando]);

  const handleSubmit = async () => {
    if (!titulo || !descricao || !dataInicio || !dataFinalizacao) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const formData = new FormData();
    formData.append("disciplina_id", disciplinaId ?? "");
    formData.append("title", titulo);
    formData.append("description", descricao);
    formData.append("start_date", dataInicio);
    formData.append("end_date", dataFinalizacao);

    formData.append("summary_text", resumoGeral);

    formData.append("summary_visual", resumoAcessibilidade.Visual);
    formData.append("summary_auditory", resumoAcessibilidade.Auditiva);
    formData.append("summary_motor", resumoAcessibilidade.Motora);
    formData.append("summary_intellectual", resumoAcessibilidade.Intelectual);

    if (file) {
      formData.append("summary_file", file);
    }

    try {
      if (isEditando) {
        await api.post(`/teacher/conteudos/${id}`, formData); // ou .put dependendo do backend
      } else {
        await api.post("/teacher/conteudos", formData);
      }
      alert("Conteúdo salvo com sucesso!");
      navigate(`/admin/disciplinas/${disciplinaId}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar conteúdo");
    }
  };

  return (
    <div className={`flex ${isEditando ? "flex-col lg:flex-row gap-6" : "flex-col gap-6"}`}>
      {/* Sidebar de Acessibilidade */}
      {isEditando && (
        <div className="lg:w-1/4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Acessibilidade</h3>
            <div className="space-y-2">
              {categoriasAcessibilidade.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAbaAtiva(cat)}
                  className={`w-full text-start px-3 py-2 rounded-md ${
                    abaAtiva === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-600 hover:text-blue-700 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 space-y-6">
        <div className="border rounded-xl p-4 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <textarea
              className="w-full border rounded-md p-2"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data de Início *</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Término *</label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={dataFinalizacao}
                onChange={(e) => setDataFinalizacao(e.target.value)}
              />
            </div>
          </div>

          {/* Resumo Geral */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Resumo Geral (texto opcional)
            </label>
            <textarea
              className="w-full border rounded-md p-2"
              rows={5}
              value={resumoGeral}
              onChange={(e) => setResumoGeral(e.target.value)}
            />
          </div>

          {/* Upload */}
          {!isEditando && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload do Resumo (.pdf ou .docx) opcional
              </label>
              <DropzoneComponent onDrop={handleFileDrop} />
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Arquivo selecionado: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Resumo para Acessibilidade */}
        {isEditando && (
          <div className="border rounded-xl p-4 space-y-2">
            <h3 className="font-medium">
              Resumo para <span className="text-blue-600">{abaAtiva}</span>
            </h3>
            <textarea
              className="w-full border rounded-md p-3"
              rows={6}
              placeholder={`Digite o resumo adaptado para ${abaAtiva}`}
              value={resumoAcessibilidade[abaAtiva]}
              onChange={(e) =>
                setResumoAcessibilidade({
                  ...resumoAcessibilidade,
                  [abaAtiva]: e.target.value,
                })
              }
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {isEditando ? "Salvar Alterações" : "Salvar Resumo"}
        </button>
      </div>
    </div>
  );
}
