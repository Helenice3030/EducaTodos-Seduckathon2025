import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { FaFileLines } from "react-icons/fa6";
import { speak } from "../../../services/utils";
import { useSpeech } from "../../../hooks/useSpeech";
import { useSwipeable } from "react-swipeable";
import { AuthContext } from "../../../context/AuthProvider";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Resume({ icone = <FaFileLines />, cor = '#2F80ED' }) {
  const { conteudo: conteudoId } = useParams();
  const navigate = useNavigate();
  const { setHeaderOptions } = useOutletContext();
  const { themeOptions } = useContext(AuthContext);

  const [conteudo, setConteudo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const speech = useSpeech();

  useEffect(() => {
    fetchConteudo();
  }, [conteudoId]);

  const fetchConteudo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/student/conteudos/${conteudoId}`, {
        headers: {
          'Accessibility-Type': 'visual'  // 🔥 importante para trazer o resumo adaptado
        }
      });
      setConteudo(data.data);

      setHeaderOptions({
        custom: true,
        color: cor,
        icon: icone,
        title: 'Resumo',
        desc: data.data.title
      });

      speak('Você está na sessão de resumo do conteúdo, toque na tela para pausar ou continuar a leitura. Toque duas vezes para começar a leitura do início.');

    } catch (error) {
      console.error(error);
      alert('Erro ao carregar o conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (speech.isPaused) {
      speech.resume();
    } else {
      speech.pause();
    }

    if (!speech.isSpeaking) {
      speech.speak(conteudo?.summary);
    }
  };

  const handlers = useSwipeable({
    onSwipedRight: () => navigate(-1),
    preventScrollOnSwipe: false,
    trackTouch: true,
    trackMouse: true,
  });

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
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
    <div className="flex flex-col h-full w-full">
      <main className="flex-1 flex flex-col items-center px-3 pt-4 pb-3">
        <section className="select-none w-full flex-1 flex flex-col">
          <div
            {...handlers}
            onClick={handleClick}
            onDoubleClick={() => {
              speech.cancel();
              handleClick();
            }}
            className="bg-white dark:bg-black dark:border-2 rounded-2xl h-full p-4 overflow-y-auto shadow-sm gap-3"
          >
            <h2 className={`font-semibold text-[#253858] dark:text-amber-300 text-xl ${getTextClass()}`}>
              {conteudo.title}
            </h2>
            <p className={`text-xl text-[#53575a] dark:text-white ${getTextClass()}`}>
              {conteudo.summary}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
