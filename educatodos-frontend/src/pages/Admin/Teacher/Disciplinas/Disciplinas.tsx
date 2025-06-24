import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import Badge from "../../../../components/ui/badge/Badge";
import Spinner from "../../../../components/common/Spinner";

import api from "../../../../services/api";

interface Disciplina {
  id: number;
  name: string;
  is_active: boolean;
  total_conteudos: number;
  conteudos_ativos: number;
  conteudos_finalizados: number;
  turma: {
    id: number;
    name: string;
  };
}

interface TurmaAgrupada {
  id: number;
  name: string;
  disciplinas: Disciplina[];
}

export default function Disciplinas() {
  const [turmas, setTurmas] = useState<TurmaAgrupada[]>([]);
  const [tabAtiva, setTabAtiva] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/teacher/disciplinas");
      const disciplinas: Disciplina[] = data.data.disciplinas;

      const agrupado = Object.values(
        disciplinas.reduce((acc, disciplina) => {
          const turmaId = disciplina.turma.id;
          if (!acc[turmaId]) {
            acc[turmaId] = {
              id: turmaId,
              name: disciplina.turma.name,
              disciplinas: [],
            };
          }
          acc[turmaId].disciplinas.push(disciplina);
          return acc;
        }, {} as Record<number, TurmaAgrupada>)
      );

      setTurmas(agrupado);
      if (agrupado.length > 0) {
        setTabAtiva(String(agrupado[0].id));
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar disciplinas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Disciplinas por Turma" />

      {loading ? (
        <Spinner />
      ) : (
        <div>
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-white/5">
            {turmas.map((turma) => (
              <button
                key={turma.id}
                onClick={() => setTabAtiva(String(turma.id))}
                className={`rounded-t-lg px-4 py-2 text-sm ${
                  tabAtiva === String(turma.id)
                    ? "border border-b-0 border-gray-200 bg-white dark:border-white/10 dark:bg-white/5"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                {turma.name}
              </button>
            ))}
          </div>

          {/* Conteúdo da Tab */}
          {turmas.map(
            (turma) =>
              String(turma.id) === tabAtiva && (
                <div
                  key={turma.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
                >
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-start">
                            Disciplina
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-start">
                            Conteúdos
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-start">
                            Status
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-start">
                            Ações
                          </TableCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {turma.disciplinas.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="px-5 py-4 text-center text-gray-500">
                              Nenhuma disciplina cadastrada para esta turma.
                            </TableCell>
                          </TableRow>
                        ) : (
                          turma.disciplinas.map((disciplina) => (
                            <TableRow key={disciplina.id}>
                              <TableCell className="px-5 py-4 text-start">
                                <Link
                                  to={`/admin/disciplinas/${disciplina.id}`}
                                  className="font-medium text-gray-800 dark:text-white"
                                >
                                  {disciplina.name}
                                </Link>
                              </TableCell>
                              <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                {disciplina.total_conteudos} conteúdos
                              </TableCell>
                              <TableCell className="px-5 py-4 text-start">
                                <Badge
                                  size="sm"
                                  color={disciplina.is_active ? "success" : "error"}
                                >
                                  {disciplina.is_active ? "Ativa" : "Encerrada"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-5 py-4 text-start">
                                <div className="flex gap-3">
                                  <Link
                                    to={`/admin/disciplinas/${disciplina.id}`}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Editar"
                                  >
                                    <FaEdit />
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </>
  );
}
