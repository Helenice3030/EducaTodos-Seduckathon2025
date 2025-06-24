import { useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { FaEye } from "react-icons/fa";
import {Modal} from "../../../../../components/ui/modal";
import Button from "../../../../../components/ui/button/Button";

interface Questao {
  id: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
}

interface RespostaAluno {
  alunoId: number;
  alunoNome: string;
  respostas: {
    questaoId: number;
    respostaSelecionada: number;
    pontuacao: number;
  }[];
  pontuacaoTotal: number;
}

const questoes: Questao[] = [
  {
    id: 1,
    pergunta: "Qual é a cor do céu?",
    opcoes: ["Azul", "Verde", "Vermelho", "Amarelo"],
    respostaCorreta: 0,
  },
  {
    id: 2,
    pergunta: "Quanto é 2 + 2?",
    opcoes: ["3", "4", "5", "6"],
    respostaCorreta: 1,
  },
  {
    id: 3,
    pergunta: "Qual a capital do Brasil?",
    opcoes: ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"],
    respostaCorreta: 1,
  },
];

const respostasAlunos: RespostaAluno[] = [
  {
    alunoId: 1,
    alunoNome: "Carlos Silva",
    respostas: [
      { questaoId: 1, respostaSelecionada: 0, pontuacao: 1 },
      { questaoId: 2, respostaSelecionada: 1, pontuacao: 1 },
      { questaoId: 3, respostaSelecionada: 1, pontuacao: 1 },
    ],
    pontuacaoTotal: 3,
  },
  {
    alunoId: 2,
    alunoNome: "Ana Souza",
    respostas: [
      { questaoId: 1, respostaSelecionada: 1, pontuacao: 0 },
      { questaoId: 2, respostaSelecionada: 2, pontuacao: 0 },
      { questaoId: 3, respostaSelecionada: 0, pontuacao: 0 },
    ],
    pontuacaoTotal: 0,
  },
];

const letras = ["A", "B", "C", "D", "E", "F"]; // Para opções

export default function RespostasQuestoes() {
  const [isOpen, setIsOpen] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<RespostaAluno | null>(null);

  function openModal(aluno: RespostaAluno) {
    setAlunoSelecionado(aluno);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setAlunoSelecionado(null);
  }

  return (
    <>


        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Aluno</TableCell>
              <TableCell isHeader>Pontuação Total</TableCell>
              <TableCell isHeader>Ações</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {respostasAlunos.map((aluno) => (
              <TableRow key={aluno.alunoId}>
                <TableCell className="px-5 py-4">{aluno.alunoNome}</TableCell>
                <TableCell className="px-5 py-4">
                  {aluno.pontuacaoTotal}/{questoes.length}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <button
                    onClick={() => openModal(aluno)}
                    title="Ver detalhes das respostas"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      {/* Modal personalizado usando seu componente */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Respostas de {alunoSelecionado?.alunoNome}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Pontuação: {alunoSelecionado?.pontuacaoTotal}/{questoes.length}
            </p>
          </div>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3 space-y-4">
            {alunoSelecionado?.respostas.map(({ questaoId, respostaSelecionada, pontuacao }) => {
              const questao = questoes.find((q) => q.id === questaoId);
              if (!questao) return null;

              const letra = letras[respostaSelecionada] ?? "?";
              const textoResposta = questao.opcoes[respostaSelecionada];
              const acertou = questao.respostaCorreta === respostaSelecionada;

              return (
                <div key={questaoId} className="border-b pb-3 last:border-b-0">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{questao.pergunta}</p>
                  <p>
                    Resposta do aluno:{" "}
                    <span className={acertou ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {letra} - {textoResposta}
                    </span>
                  </p>
                  <p>Pontuação: {pontuacao}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
