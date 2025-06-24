import { useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import { useNavigate } from "react-router";
import { FaSave, FaArrowLeft } from "react-icons/fa";


const alunos: any = [
  {
    id: 1,
    nome: "Carlos Silva",
    email: "carlos.silva@escola.com",
    ra: 'RA3523',
    birthdate: '15/03/2006'
  },
  {
    id: 2,
    nome: "Ana Souza",
    email: "ana.souza@escola.com",
    ra: 'RA3523',
    birthdate: '15/03/2006'
  },
  {
    id: 3,
    nome: "João Pereira",
    email: "joao.pereira@escola.com",
    ra: 'RA3523',
    birthdate: '15/03/2006'
  },
];


export default function EditResponsavel() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [aluno, setAluno] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !aluno || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    const responsavel = {
      nome,
      email,
      aluno,
      senha,
    };

    console.log("Dados do aluno:", responsavel);

    // Aqui você pode fazer a chamada da API para salvar no backend

    navigate("/admin/responsaveis"); // Redireciona após cadastro
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Cadastrar Responsável" />

      <div className="max-w-xl mx-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
              placeholder="Digite o nome do professor"
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

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Aluno
            </label>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
            >
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-transparent dark:border-gray-600"
              placeholder="Digite uma senha"
            />
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
    </>
  );
}
