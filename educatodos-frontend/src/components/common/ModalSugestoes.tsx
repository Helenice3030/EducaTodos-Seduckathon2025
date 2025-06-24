import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { toast } from "react-toastify";

import {
  FaClock,
  FaLightbulb,
  FaTriangleExclamation,
  FaUserSecret,
  FaChevronLeft,
  FaPaperPlane,
} from "react-icons/fa6";
import api from "../../services/api";

export default function ModalSugestoes({ isOpen, onClose }) {
  const [etapa, setEtapa] = useState<"tipo" | "texto" | "horario">("tipo");
  const [tipoSelecionado, setTipoSelecionado] = useState<null | string>(null);
  const [texto, setTexto] = useState("");
  const [avisos, setAvisos] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAvisos();
    }
  }, [isOpen]);

  const fetchAvisos = async () => {
    try {
      const { data } = await api.get("/student/avisos");
      setAvisos(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
    }
  };

  const resetar = () => {
    setEtapa("tipo");
    setTipoSelecionado(null);
    setTexto("");
  };

  const handleClose = () => {
    resetar();
    onClose();
  };

  const handleSelecionarTipo = (tipo: string) => {
    if (tipo === "Horário Escolar") {
      setEtapa("horario");
    } else {
      setTipoSelecionado(tipo);
      setEtapa("texto");
    }
  };

  const handleEnviar = async () => {
    try {
      await api.post("/student/feedbacks", {
        type: tipoSelecionado?.includes("Denúncia") ? "denuncia" : "feedback",
        is_anonymous: tipoSelecionado === "Denúncia Anônima",
        description: texto,
      });
      toast(`Enviado com sucesso: ${tipoSelecionado}`, { type: "success" });
      handleClose();
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast("Erro ao enviar. Tente novamente.", { type: "error" });
    }
  };

  const horarios = {
    Segunda: ["Português", "Matemática", "História", "Ciências", "Educação Física"],
    Terça: ["Geografia", "Matemática", "Português", "Artes", "Ciências"],
    Quarta: ["Matemática", "História", "Português", "Geografia", "Inglês"],
    Quinta: ["Ciências", "Matemática", "Português", "Artes", "História"],
    Sexta: ["Educação Física", "Matemática", "Ciências", "Português", "Geografia"],
  };

  const opcoes = [
    { nome: "Horário Escolar", icone: <FaClock />, cor: "bg-blue-100 hover:bg-blue-200 text-blue-900" },
    { nome: "Sugestão", icone: <FaLightbulb />, cor: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700" },
    { nome: "Denúncia", icone: <FaTriangleExclamation />, cor: "bg-red-100 hover:bg-red-200 text-red-700" },
    { nome: "Denúncia Anônima", icone: <FaUserSecret />, cor: "bg-purple-100 hover:bg-purple-200 text-purple-700" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        {etapa === "tipo" && (
          <>
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Menu de Opções
            </h4>

            {avisos.length > 0 && (
              <div className="py-1 px-2 bg-amber-200 my-5 rounded-xl w-full">
                <b className="text-sm">Avisos</b>
                <ul className="text-sm list-disc list-inside mt-1">
                  {avisos.map((aviso, index) => (
                    <li key={index}>{aviso.content}</li>
                  ))}
                </ul>
              </div>
            )}

            <hr className="mb-3" />
            <div className="flex flex-col gap-4">
              {opcoes.map(({ nome, icone, cor }) => (
                <button
                  key={nome}
                  onClick={() => handleSelecionarTipo(nome)}
                  className={`flex items-center gap-3 w-full rounded-xl ${cor} dark:bg-white/[0.05] dark:hover:bg-white/[0.1] px-4 py-3 text-left font-semibold transition`}
                >
                  <span className="text-xl">{icone}</span>
                  {nome}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
              >
                Fechar
              </button>
            </div>
          </>
        )}

        {etapa === "texto" && (
          <>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {tipoSelecionado}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Escreva abaixo sua {tipoSelecionado?.toLowerCase()}.
            </p>
            <textarea
              rows={6}
              className="w-full rounded-xl border border-gray-300 bg-gray-100 p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-white/[0.05] dark:text-gray-200"
              placeholder="Digite aqui..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />

            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={() => setEtapa("tipo")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
              >
                <FaChevronLeft /> Voltar
              </button>
              <button
                onClick={handleEnviar}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                disabled={!texto.trim()}
              >
                <FaPaperPlane /> Enviar
              </button>
            </div>
          </>
        )}

        {etapa === "horario" && (
          <>
            <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Horário Escolar
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-2 dark:border-gray-600">Dia</th>
                    {[1, 2, 3, 4, 5].map((aula) => (
                      <th key={aula} className="border px-2 py-2 dark:border-gray-600">
                        {aula}ª Aula
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(horarios).map(([dia, aulas]) => (
                    <tr key={dia}>
                      <td className="border px-2 py-2 font-semibold dark:border-gray-600">
                        {dia}
                      </td>
                      {aulas.map((aula, index) => (
                        <td key={index} className="border px-2 py-2 dark:border-gray-600">
                          {aula}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setEtapa("tipo")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
              >
                <FaChevronLeft /> Voltar
              </button>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
