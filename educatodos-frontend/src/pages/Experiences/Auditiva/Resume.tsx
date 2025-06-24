import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import Footer from "../../../components/common/Footer";
import { FaHandSparkles, FaXmark, FaFileLines } from "react-icons/fa6";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Resume() {
  const { conteudo: conteudoId } = useParams();
  const { setHeaderOptions } = useOutletContext();

  const [conteudo, setConteudo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [materiaLibras, setMateriaLibras] = useState<string | null>(null);

  const abrirLibras = (texto: string) => setMateriaLibras(texto);
  const fecharLibras = () => setMateriaLibras(null);

  useEffect(() => {
    fetchConteudo();
  }, [conteudoId]);

  const fetchConteudo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/student/conteudos/${conteudoId}`);
      setConteudo(data.data);

      setHeaderOptions({
        custom: true,
        color: '#2F80ED',
        icon: <FaFileLines />,
        title: 'Resumo',
        desc: data.data.title
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar o resumo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!conteudo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Conteúdo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FB] flex flex-col justify-between min-h-screen">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">
        <section className="w-full max-w-xs flex flex-col">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start">
              <span className="font-semibold text-[#253858] text-lg">{conteudo.title}</span>
              <button
                className="ml-3 flex items-center gap-1 px-2 py-1 rounded-md text-[#21C87A] bg-[#21C87A]/10 text-2xl font-semibold active:bg-[#21C87A]/20"
                onClick={() => abrirLibras(conteudo.title)}
              >
                <FaHandSparkles />
              </button>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-1">Resumo Geral:</h4>
              <p className="text-sm text-[#4F5B69] whitespace-pre-line">{conteudo.summary}</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center mt-4">
          <span className="text-xs text-[#4F5B69] mb-1 text-center">
            Toque no botão
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#21C87A]/10 rounded-md text-[#21C87A] font-bold ml-1">
              <FaHandSparkles /> Libras
            </span>
            para assistir à explicação em Língua Brasileira de Sinais.
          </span>
        </section>
      </main>

      <Footer />

    </div>
  );
}
