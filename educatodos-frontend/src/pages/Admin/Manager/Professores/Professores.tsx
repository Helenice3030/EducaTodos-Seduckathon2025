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

interface Professor {
  id: number;
  name: string;
  email: string;
}

export default function Professores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfessores = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/professores");
      const lista: Professor[] = data.data.teachers;
      setProfessores(lista);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar professores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Professores" />

      {/* Botão Cadastrar */}
      <div className="flex justify-end mb-4">
        <Link
          to="/admin/professores/cadastrar"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <FaPlus className="text-sm" />
          Cadastrar Professor
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
                    Nome
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    E-mail
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {professores.length > 0 ? (
                  professores.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell className="px-5 py-4 text-start">
                        {prof.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {prof.email}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex gap-3">
                          <Link
                            to={`/admin/professores/${prof.id}`}
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
                      Nenhum professor encontrado.
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
