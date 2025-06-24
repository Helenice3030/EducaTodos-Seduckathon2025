import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";

export default function EditTurma() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega dados da turma para edição
  const fetchTurma = async () => {
    if (id == 'cadastrar') return;
    setLoading(true);
    try {
      const { data } = await api.get(`/manager/turmas/${id}`);
      setNome(data.data.name);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar turma.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurma();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Preencha o nome da turma!");
      return;
    }

    const payload = { name: nome.trim() };

    setLoading(true);
    try {
      if (id != 'cadastrar') {
        // Edição
        await api.put(`/manager/turmas/${id}`, payload);
      } else {
        // Criação
        await api.post("/manager/turmas", payload);
      }
      navigate("/admin/turmas");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar turma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={id != 'cadastrar' ? "Editar Turma" : "Cadastrar Turma"} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nome */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome da Turma
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
                placeholder="Digite o nome da turma"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/turmas")}
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
