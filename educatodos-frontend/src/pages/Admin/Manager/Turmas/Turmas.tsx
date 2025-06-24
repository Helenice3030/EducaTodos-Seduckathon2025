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

interface Turma {
  id: number;
  nome: string;
  ano: string;
  quantidadeDisciplinas: number;
}

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTurmas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/turmas");
      const lista: Turma[] = data.data.turmas;
      setTurmas(lista);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Turmas" />

      {/* Botão Cadastrar */}
      <div className="flex justify-end mb-4">
        <Link
          to="/admin/turmas/cadastrar"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <FaPlus className="text-sm" />
          Cadastrar Turma
        </Link>
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
                    Turma
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <Link
                          to={`/admin/turmas/${turma.id}`}
                          className="font-medium text-gray-800 dark:text-white"
                        >
                          {turma.name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/turmas/${turma.id}`}
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
                    <TableCell colSpan={4} className="px-5 py-4 text-center">
                      Nenhuma turma encontrada.
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
