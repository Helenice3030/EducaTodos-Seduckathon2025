import { useEffect, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Modal } from "../../../../components/ui/modal";
import Spinner from "../../../../components/common/Spinner";
import api from "../../../../services/api";

interface Feedback {
  id: number;
  student_name: string;
  text: string;
  date: string;
}

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackSelecionado, setFeedbackSelecionado] = useState<Feedback | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/feedbacks");
      setFeedbacks(data.data.feedbacks);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar os feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (feedback: Feedback) => {
    setFeedbackSelecionado(feedback);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setFeedbackSelecionado(null);
  };

  const removerFeedback = async (id: number) => {
    if (!confirm("Deseja realmente excluir este feedback?")) return;
    try {
      await api.delete(`/manager/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir o feedback.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Feedbacks" />

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
                    Feedback
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Data
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-start">
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {feedbacks.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {fb.student_name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                      {fb.description.length > 60 ? fb.description.substring(0, 60) + "..." : fb.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                      {new Date(fb.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Visualizar"
                          onClick={() => openModal(fb)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                          onClick={() => removerFeedback(fb.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Feedback de {feedbackSelecionado?.student_name}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Data: {new Date(feedbackSelecionado?.created_at || "").toLocaleDateString("pt-BR")}
            </p>
            <div className="bg-gray-100 dark:bg-white/[0.05] rounded-lg p-4 text-gray-700 dark:text-gray-300">
              {feedbackSelecionado?.description}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-2 mt-6">
            <button
              onClick={closeModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
