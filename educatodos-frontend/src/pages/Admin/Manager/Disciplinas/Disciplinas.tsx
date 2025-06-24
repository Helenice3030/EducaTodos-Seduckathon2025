import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

import { FaEdit, FaPlus } from "react-icons/fa";
import { Link } from "react-router";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";

interface Disciplina {
  id: number;
  nome: string;
  professor: string;
  turma: string;
}

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(false);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("");

  const fetchDisciplinas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/disciplinas");
      const lista: Disciplina[] = data.data.disciplinas;
      console.log(lista)

      setDisciplinas(lista);

      const turmasUnicas = Array.from(
        new Set(lista.map((d) => d.turma.name))
      ).sort();
      setTurmas(turmasUnicas);
      setTurmaSelecionada(turmasUnicas[0] || "");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  const disciplinasFiltradas = disciplinas.filter(
    (d) => d.turma.name === turmaSelecionada
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Disciplinas" />

      {/* Botão Cadastrar */}
      <div className="flex justify-end mb-4">
        <Link
          to="/admin/disciplinas/cadastrar"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <FaPlus className="text-sm" />
          Cadastrar Disciplina
        </Link>
      </div>

      {/* Tabs de Turmas */}
      <div className="mb-4 border-b border-gray-200 dark:border-white/[0.05]">
        <nav className="-mb-px flex gap-4">
          {turmas.map((turma) => (
            <button
              key={turma}
              onClick={() => setTurmaSelecionada(turma)}
              className={`px-3 py-2 text-sm font-medium ${
                turmaSelecionada === turma
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {turma}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Disciplina
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Professor
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {disciplinasFiltradas.length > 0 ? (
                  disciplinasFiltradas.map((disciplina) => (
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
                        {disciplina.teacher.name}
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="px-5 py-4 text-center">
                      Nenhuma disciplina encontrada para esta turma.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
