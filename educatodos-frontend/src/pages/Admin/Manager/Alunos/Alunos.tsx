import { useEffect, useState } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { Link } from "react-router";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import api from "../../../../services/api";
import Spinner from "../../../../components/common/Spinner";
import moment from 'moment'
interface Aluno {
  id: number;
  name: string;
  email: string | null;
  ra: string | null;
  birth_date: string;
  parent_name: string;
  parent_email: string | null;
}

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/alunos");
      setAlunos(data.data.students);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar alunos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Alunos" />

      <div className="flex justify-end mb-4">
        <Link
          to="/admin/alunos/cadastrar"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <FaPlus className="text-sm" />
          Cadastrar Aluno
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
                    Aluno
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    RA
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Nascimento
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Responsável
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <Link
                          to={`/admin/alunos/${aluno.id}`}
                          className="font-medium text-gray-800 dark:text-white"
                        >
                          <div className="flex flex-col">
                            {aluno.name}
                            {aluno.email && (
                              <span className="text-gray-600 font-normal text-sm">
                                {aluno.email}
                              </span>
                            )}
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                        {aluno.ra || "—"}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                        {moment(aluno.birth_date).format('DD/MM/YYYY')}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <span className="text-gray-800 dark:text-white">{aluno.primary_parent.name}</span>
                          {aluno.primary_parent.email && (
                            <span className="text-gray-600 font-normal text-sm">
                              {aluno.primary_parent.email}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/alunos/${aluno.id}`}
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
                    <TableCell colSpan={5} className="px-5 py-4 text-center">
                      Nenhum aluno encontrado.
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
