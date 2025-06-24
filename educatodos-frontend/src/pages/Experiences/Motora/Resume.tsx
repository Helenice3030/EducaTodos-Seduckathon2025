import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import VoiceFooter from "../../../components/experiences/motora/VoiceFooter";
import { FaFileLines } from "react-icons/fa6";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Resume({ icone = <FaFileLines />, cor = '#2F80ED' }) {
  const { conteudo: conteudoId } = useParams();
  const { setHeaderOptions } = useOutletContext();

  const [conteudo, setConteudo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        color: cor,
        icon: icone,
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
    <div className="bg-[#F6F8FB] flex-1 flex flex-col justify-between min-h-screen">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">
        <section className="w-full max-w-xs flex flex-col">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-[#253858] text-xl">
                {conteudo.title}
              </span>
              <span className="text-lg text-[#53575a] whitespace-pre-line">
                {conteudo.summary}
              </span>
            </div>
          </div>
        </section>
      </main>
      <VoiceFooter />
    </div>
  );
}
