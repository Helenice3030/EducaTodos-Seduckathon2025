import { useState } from "react";
import { FaTrash, FaPlus, FaCheckCircle } from "react-icons/fa";
import DropzoneComponent from "../../../../../components/form/form-elements/DropZone";

interface Questao {
  id: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
}

export default function Questoes() {
  const [questoes, setQuestoes] = useState<Questao[]>([
    {
      id: Date.now(),
      pergunta: "",
      opcoes: ["", ""],
      respostaCorreta: 0,
    },
  ]);

  const adicionarQuestao = () => {
    setQuestoes([
      ...questoes,
      {
        id: Date.now(),
        pergunta: "",
        opcoes: ["", ""],
        respostaCorreta: 0,
      },
    ]);
  };

  const atualizarQuestao = (
    id: number,
    campo: keyof Questao,
    valor: string | number | string[]
  ) => {
    const atualizadas = questoes.map((q) =>
      q.id === id ? { ...q, [campo]: valor } : q
    );
    setQuestoes(atualizadas);
  };

  const atualizarOpcao = (id: number, index: number, valor: string) => {
    const atualizadas = questoes.map((q) => {
      if (q.id === id) {
        const novas = [...q.opcoes];
        novas[index] = valor;
        return { ...q, opcoes: novas };
      }
      return q;
    });
    setQuestoes(atualizadas);
  };

  const adicionarOpcao = (id: number) => {
    const atualizadas = questoes.map((q) =>
      q.id === id ? { ...q, opcoes: [...q.opcoes, ""] } : q
    );
    setQuestoes(atualizadas);
  };

  const removerQuestao = (id: number) => {
    setQuestoes(questoes.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Questões do Conteúdo</h2>

      {/* Dropzone no topo */}
      <div className="border rounded-xl p-4">
        <h3 className="font-medium mb-2">Envie um arquivo com questões (.docx ou .pdf)</h3>
        <DropzoneComponent />
      </div>

      {/* Editor manual de questões */}
      {questoes.map((q) => (
        <div
          key={q.id}
          className="border rounded-xl p-4 space-y-4 bg-white dark:bg-white/5"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">
              Questão #{questoes.indexOf(q) + 1}
            </span>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => removerQuestao(q.id)}
              title="Remover questão"
            >
              <FaTrash />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pergunta</label>
            <input
              className="w-full border rounded-md p-2"
              placeholder="Digite a pergunta"
              value={q.pergunta}
              onChange={(e) =>
                atualizarQuestao(q.id, "pergunta", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Opções de Resposta
            </label>
            <div className="space-y-2">
              {q.opcoes.map((op, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border rounded-md p-2"
                    placeholder={`Opção ${idx + 1}`}
                    value={op}
                    onChange={(e) =>
                      atualizarOpcao(q.id, idx, e.target.value)
                    }
                  />
                  <input
                    type="radio"
                    name={`resposta-${q.id}`}
                    checked={q.respostaCorreta === idx}
                    onChange={() =>
                      atualizarQuestao(q.id, "respostaCorreta", idx)
                    }
                    title="Marcar como correta"
                  />
                  {q.respostaCorreta === idx && (
                    <FaCheckCircle className="text-green-600" />
                  )}
                </div>
              ))}
              <button
                onClick={() => adicionarOpcao(q.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Adicionar Opção
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={adicionarQuestao}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus /> Adicionar Questão
        </button>
      </div>

      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
        Salvar Questões
      </button>
    </div>
  );
}
