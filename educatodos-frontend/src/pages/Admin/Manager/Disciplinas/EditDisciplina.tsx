import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";

interface Turma {
  id: number;
  name: string;
}

interface Professor {
  id: number;
  name: string;
}

export default function EditDisciplina() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [turmaId, setTurmaId] = useState<number | "">("");
  const [professorId, setProfessorId] = useState<number | "">("");

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega dados da disciplina para edição
  const fetchDisciplina = async () => {
    if (id === "cadastrar") return;
    setLoading(true);
    try {
      const { data } = await api.get(`/manager/disciplinas/${id}`);
      const disciplina = data.data;
      setNome(disciplina.name);
      setTurmaId(disciplina.turma_id);
      setProfessorId(disciplina.teacher_id);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar disciplina.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega turmas e professores
  const fetchAuxiliares = async () => {
    try {
      const [resTurmas, resProfessores] = await Promise.all([
        api.get("/manager/turmas"),
        api.get("/manager/professores"),
      ]);


      setTurmas(resTurmas.data.data.turmas);
      setProfessores(resProfessores.data.data.teachers);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar turmas ou professores.");
    }
  };

  useEffect(() => {
    fetchAuxiliares();
    fetchDisciplina();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !turmaId || !professorId) {
      alert("Preencha todos os campos!");
      return;
    }

    const payload = {
      name: nome.trim(),
      turma_id: turmaId,
      teacher_id: professorId,
    };

    setLoading(true);
    try {
      if (id !== "cadastrar") {
        // Edição
        await api.put(`/manager/disciplinas/${id}`, payload);
      } else {
        // Criação
        await api.post("/manager/disciplinas", payload);
      }
      navigate("/admin/disciplinas");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar disciplina.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        pageTitle={id !== "cadastrar" ? "Editar Disciplina" : "Cadastrar Disciplina"}
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nome */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Nome da Disciplina
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
                placeholder="Digite o nome da disciplina"
              />
            </div>

            {/* Campo Turma */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Turma
              </label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
              >
                <option value="">Selecione uma turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Professor */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                Professor Responsável
              </label>
              <select
                value={professorId}
                onChange={(e) => setProfessorId(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
              >
                <option value="">Selecione um professor</option>
                {professores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/disciplinas")}
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
