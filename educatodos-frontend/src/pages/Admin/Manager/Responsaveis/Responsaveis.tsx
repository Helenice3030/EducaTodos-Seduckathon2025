import { FaPlus } from "react-icons/fa6";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

import { FaCog, FaEdit, FaUsers } from "react-icons/fa";
import { Link } from "react-router";

interface responsavel {
  id: number;
  nome: string;
  aluno: string;
  email: string;
  birthdate: string;
}

const responsaveis: responsavel[] = [
  {
    id: 1,
    nome: "Carlos Silva",
    aluno: "Arthur Silva",
    email: "carlos.silva@escola.com",
    birthdate: '15/03/2006'
  },
  {
    id: 2,
    nome: "Ana Souza",
    aluno: "José Souza",
    email: "ana.souza@escola.com",
    birthdate: '15/03/2006'
  },
  {
    id: 3,
    nome: "João Pereira",
    aluno: "Arthur Silva",
    email: "joao.pereira@escola.com",
    birthdate: '15/03/2006'
  },
];

export default function Responsaveis() {
  return (
    <>
      <PageBreadcrumb pageTitle="Responsáveis" />

      <div className="flex justify-end mb-4">
        <Link
          to="/admin/responsaveis/cadastrar"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <FaPlus className="text-sm" />
          Cadastrar Responsável
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                  Nome
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                  Aluno
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                  Data de Nascimento
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-start">
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {responsaveis.map((responsavel) => (
                <TableRow key={responsavel.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <Link
                      to={`/admin/responsaveis/${responsavel.id}`}
                      className="font-medium text-gray-800 dark:text-white"
                    >
                      <div className="flex flex-col">
                      {responsavel.nome}
                      <span className="text-gray-600 font-normal text-sm">{responsavel.email}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                    {responsavel.aluno}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                    {responsavel.birthdate}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
