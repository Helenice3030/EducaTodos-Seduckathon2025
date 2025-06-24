import { useState } from "react";
import { FaTrash, FaPlus, FaLink, FaFileUpload, FaYoutube } from "react-icons/fa";

const categorias = ["Visual", "Auditiva", "Motora", "Intelectual"] as const;

interface Material {
  id: number;
  tipo: "link" | "arquivo" | "video";
  titulo: string;
  descricao: string;
  valor: string; // URL ou nome do arquivo
}

export default function Materiais() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<(typeof categorias)[number]>("Visual");

  const [materiais, setMateriais] = useState<Record<string, Material[]>>({
    Visual: [],
    Auditiva: [],
    Motora: [],
    Intelectual: [],
  });

  const adicionarMaterial = (tipo: Material["tipo"]) => {
    const novo: Material = {
      id: Date.now(),
      tipo,
      titulo: "",
      descricao: "",
      valor: "",
    };
    setMateriais({
      ...materiais,
      [categoriaAtiva]: [...materiais[categoriaAtiva], novo],
    });
  };

  const atualizarMaterial = (id: number, campo: keyof Material, valor: string) => {
    const atualizados = materiais[categoriaAtiva].map((m) =>
      m.id === id ? { ...m, [campo]: valor } : m
    );
    setMateriais({ ...materiais, [categoriaAtiva]: atualizados });
  };

  const removerMaterial = (id: number) => {
    const filtrados = materiais[categoriaAtiva].filter((m) => m.id !== id);
    setMateriais({ ...materiais, [categoriaAtiva]: filtrados });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-1/4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Acessibilidade</h3>
          <div className="space-y-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`w-full text-start px-3 py-2 rounded-md ${
                  categoriaAtiva === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-600 hover:text-blue-700 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <div className="mb-4 flex gap-3 flex-wrap">
          <button
            onClick={() => adicionarMaterial("link")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <FaLink /> Adicionar Link
          </button>
          <button
            onClick={() => adicionarMaterial("arquivo")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            <FaFileUpload /> Adicionar Arquivo
          </button>
          <button
            onClick={() => adicionarMaterial("video")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            <FaYoutube /> Adicionar Vídeo
          </button>
        </div>

        {materiais[categoriaAtiva].length === 0 && (
          <p className="text-sm text-gray-500">
            Nenhum material cadastrado para <b>{categoriaAtiva}</b>.
          </p>
        )}

        {materiais[categoriaAtiva].map((material) => (
          <div
            key={material.id}
            className="border rounded-lg p-4 mb-4 flex flex-col gap-3"
          >
            <div className="flex gap-2 items-center">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  material.tipo === "link"
                    ? "bg-blue-100 text-blue-700"
                    : material.tipo === "arquivo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {material.tipo === "link"
                  ? "Link"
                  : material.tipo === "arquivo"
                  ? "Arquivo"
                  : "Vídeo"}
              </span>
              {material.tipo === "video" && <FaYoutube className="text-red-600" />}
              <button
                onClick={() => removerMaterial(material.id)}
                className="ml-auto text-red-600 hover:text-red-800"
                title="Remover material"
              >
                <FaTrash />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                className="w-full border rounded-md p-2"
                placeholder="Ex.: Aula sobre Funções"
                value={material.titulo}
                onChange={(e) =>
                  atualizarMaterial(material.id, "titulo", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                className="w-full border rounded-md p-2"
                rows={2}
                placeholder="Descrição breve sobre o material"
                value={material.descricao}
                onChange={(e) =>
                  atualizarMaterial(material.id, "descricao", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {material.tipo === "link"
                  ? "URL do material"
                  : material.tipo === "arquivo"
                  ? "Nome do arquivo (simulado)"
                  : "Link do vídeo no YouTube"}
              </label>

              {material.tipo === "link" || material.tipo === "video" ? (
                <input
                  className="w-full border rounded-md p-2"
                  placeholder="https://..."
                  value={material.valor}
                  onChange={(e) =>
                    atualizarMaterial(material.id, "valor", e.target.value)
                  }
                />
              ) : (
                <input
                  type="file"
                  onChange={(e) =>
                    atualizarMaterial(
                      material.id,
                      "valor",
                      e.target.files?.[0]?.name || ""
                    )
                  }
                />
              )}
            </div>
          </div>
        ))}

        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Salvar Materiais
        </button>
      </div>
    </div>
  );
}
