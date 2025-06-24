import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";

export default function EditProfessor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  const isCadastro = id === "cadastrar";

  // Carrega dados do professor para edição
  const fetchProfessor = async () => {
    if (isCadastro) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/manager/professores/${id}`);
      const professor = data.data.user;
      setNome(professor.name);
      setEmail(professor.email);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar professor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || (isCadastro && !senha.trim())) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const payload: any = {
      name: nome.trim(),
      email: email.trim(),
    };

    // Senha só é enviada se estiver preenchida
    if (senha.trim()) {
      payload.password = senha.trim();
    }

    setLoading(true);
    try {
      if (isCadastro) {
        await api.post("/manager/professores", payload);
      } else {
        await api.put(`/manager/professores/${id}`, payload);
      }
      navigate("/admin/professores");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar professor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isCadastro ? "Cadastrar Professor" : "Editar Professor"} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nome */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome do Professor
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
                placeholder="Digite o nome"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
                placeholder="Digite o e-mail"
              />
            </div>

            {/* Campo Senha */}
            {isCadastro && <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
                placeholder={isCadastro ? "Digite a senha" : "Deixe em branco para não alterar"}
              />
            </div>}

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/professores")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
              >
                <FaArrowLeft />
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <FaSave />
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
