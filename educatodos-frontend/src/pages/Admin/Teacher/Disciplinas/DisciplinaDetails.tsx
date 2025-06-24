import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import Badge from "../../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { FaEdit, FaTrash } from "react-icons/fa";
import Spinner from "../../../../components/common/Spinner";
import api from "../../../../services/api";

interface Conteudo {
  id: number;
  titulo: string;
  descricao: string;
  data_termino: string;
}

interface Disciplina {
  id: number;
  name: string;
  is_active: boolean;
  turma: {
    id: number;
    name: string;
  };
}

export default function DisciplinaDetails() {
  const { disciplinaId } = useParams();
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [activeTab, setActiveTab] = useState<"ativos" | "finalizados">("ativos");
  const [loading, setLoading] = useState(false);

  const hoje = new Date();

  const fetchDados = async () => {
    setLoading(true);
    try {
      
      const [disciplinaRes, conteudosRes] = await Promise.all([
        api.get(`/teacher/disciplinas/${disciplinaId}`),
        api.get(`/teacher/disciplinas/${disciplinaId}/conteudos`),
      ]);

      setDisciplina(disciplinaRes.data.data);
      setConteudos(conteudosRes.data.data.conteudos);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados da disciplina.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [disciplinaId]);

  const conteudosAtivos = conteudos.filter(
    (c) => new Date(c.end_date) >= hoje
  );

  const conteudosFinalizados = conteudos.filter(
    (c) => new Date(c.end_date) < hoje
  );

  const renderTable = (lista: Conteudo[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell isHeader className="text-start">
            Título
          </TableCell>
          <TableCell isHeader className="text-start">
            Descrição
          </TableCell>
          <TableCell isHeader className="text-start">
            Data de Término
          </TableCell>
          <TableCell isHeader className="text-start">
            Ações
          </TableCell>
        </TableRow>
      </TableHeader>

      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {lista.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center px-5 py-4">
              Nenhum conteúdo encontrado.
            </TableCell>
          </TableRow>
        ) : (
          lista.map((conteudo) => (
            <TableRow key={conteudo.id}>
              <TableCell className="px-5 py-4 text-start font-medium">
                <Link to={`/admin/disciplinas/${disciplinaId}/conteudos/${conteudo.id}`}>
                  {conteudo.title}
                </Link>
              </TableCell>
              <TableCell className="px-5 py-4 text-start text-gray-500">
                {conteudo.description}
              </TableCell>
              <TableCell className="px-5 py-4 text-start text-gray-500">
                {new Date(conteudo.end_date).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="px-5 py-4 text-start">
                <div className="flex gap-3">
                  <Link
                    to={`/admin/disciplinas/${disciplinaId}/conteudos/${conteudo.id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                    // Implementar a exclusão se desejar
                  >
                    <FaTrash />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading || !disciplina) {
    return <Spinner />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle={`Disciplina: ${disciplina.name}`} />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
          Informações da Disciplina
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-500 text-sm">Turma</span>
            <div className="font-medium">{disciplina.turma.name}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Status</span>
            <div>
              <Badge
                size="sm"
                color={disciplina.is_active ? "success" : "error"}
              >
                {disciplina.is_active ? "Ativa" : "Encerrada"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Conteúdos da Disciplina
          </h2>
          <Link
            to={`/admin/disciplinas/${disciplinaId}/conteudos/cadastrar`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
          >
            + Novo Conteúdo
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex border-b border-gray-200 dark:border-white/[0.1]">
          <button
            className={`mr-6 pb-2 ${
              activeTab === "ativos"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("ativos")}
          >
            Ativos ({conteudosAtivos.length})
          </button>
          <button
            className={`pb-2 ${
              activeTab === "finalizados"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("finalizados")}
          >
            Finalizados ({conteudosFinalizados.length})
          </button>
        </div>

        {/* Conteúdos conforme aba */}
        <div className="max-w-full overflow-x-auto">
          {activeTab === "ativos" && renderTable(conteudosAtivos)}
          {activeTab === "finalizados" && renderTable(conteudosFinalizados)}
        </div>
      </div>
    </>
  );
}
