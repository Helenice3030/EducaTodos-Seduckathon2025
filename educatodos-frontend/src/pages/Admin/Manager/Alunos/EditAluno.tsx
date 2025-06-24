import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";

export default function EditAluno() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ra, setRa] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [turmaId, setTurmaId] = useState<number | "">("");
  const [turmas, setTurmas] = useState<any[]>([]);

  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentRelationship, setParentRelationship] = useState("pai");
  const [parentBirthDate, setParentBirthDate] = useState("");

  const [loading, setLoading] = useState(false);

  const isCadastro = id === "cadastrar";

  const fetchAluno = async () => {
    if (isCadastro) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/manager/alunos/${id}`);
      const aluno = data.data;

      setNome(aluno.user.name);
      setEmail(aluno.user.email || "");
      setRa(aluno.ra || "");
      setBirthDate(aluno.user.birth_date || "");
      setTurmaId(aluno.turma_id);

      setParentName(aluno.parents[0].user.name);
      setParentEmail(aluno.parents[0].user.email || "");
      setParentPhone(aluno.parents[0].user.phone || "");
      setParentRelationship(aluno.parents[0].relationship);
      setParentBirthDate(aluno.parents[0].user.birth_date);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar aluno.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTurmas = async () => {
    try {
      const { data } = await api.get("/manager/turmas");
      setTurmas(data.data.turmas);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar turmas.");
    }
  };

  useEffect(() => {
    fetchAluno();
    fetchTurmas();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !birthDate || !turmaId || !parentName.trim() || !parentRelationship || !parentBirthDate) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const payload = {
      name: nome.trim(),
      email: email.trim() || null,
      ra: ra.trim() || null,
      birth_date: birthDate,
      turma_id: turmaId,

      parent_name: parentName.trim(),
      parent_email: parentEmail.trim() || null,
      parent_phone: parentPhone.trim() || null,
      parent_relationship: parentRelationship,
      parent_birth_date: parentBirthDate,
    };

    setLoading(true);
    try {
      if (isCadastro) {
        await api.post("/manager/alunos", payload);
      } else {
        await api.put(`/manager/alunos/${id}`, payload);
      }
      navigate("/admin/alunos");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar aluno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={isCadastro ? "Cadastrar Aluno" : "Editar Aluno"} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dados do Aluno */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Dados do Aluno</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Nome *</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="input"
                      placeholder="Digite o nome do aluno"
                    />
                  </div>
                  <div>
                    <label className="label">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="E-mail do aluno"
                    />
                  </div>
                  <div>
                    <label className="label">RA</label>
                    <input
                      type="text"
                      value={ra}
                      onChange={(e) => setRa(e.target.value)}
                      className="input"
                      placeholder="RA do aluno"
                    />
                  </div>
                  <div>
                    <label className="label">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Turma *</label>
                    <select
                      value={turmaId}
                      onChange={(e) => setTurmaId(Number(e.target.value))}
                      className="input"
                    >
                      <option value="">Selecione uma turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados do Responsável */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Dados do Responsável</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Nome do Responsável *</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="input"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="label">E-mail</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="input"
                      placeholder="E-mail do responsável"
                    />
                  </div>
                  <div>
                    <label className="label">Telefone</label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="input"
                      placeholder="Telefone do responsável"
                    />
                  </div>
                  <div>
                    <label className="label">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={parentBirthDate}
                      onChange={(e) => setParentBirthDate(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Parentesco *</label>
                    <select
                      value={parentRelationship}
                      onChange={(e) => setParentRelationship(e.target.value)}
                      className="input"
                    >
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                      <option value="avo">Avô</option>
                      <option value="ava">Avó</option>
                      <option value="tio">Tio</option>
                      <option value="tia">Tia</option>
                      <option value="responsavel_legal">Responsável Legal</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/alunos")}
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
