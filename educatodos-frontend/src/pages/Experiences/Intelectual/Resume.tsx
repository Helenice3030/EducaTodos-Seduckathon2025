import { useContext, useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import {
  FaFileLines,
} from "react-icons/fa6";
import Footer from "../../../components/common/Footer";
import { AuthContext } from "../../../context/AuthProvider";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Resume({ icone = <FaFileLines />, cor = '#2F80ED' }) {
  const { conteudo: conteudoId } = useParams(); // pega o id da URL
  const [conteudo, setConteudo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { setHeaderOptions } = useOutletContext();
  const { themeOptions } = useContext(AuthContext);
  const { theme } = useTheme();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      color: cor,
      icon: icone,
      title: 'Resumo',
      desc: 'Resumo do conteúdo',
    });
  }, []);

  useEffect(() => {
    fetchConteudo();
  }, [conteudoId]);

  const fetchConteudo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/student/conteudos/${conteudoId}`, {
        headers: {
          "Accessibility-Type": "visual", // ou "auditory", "motor", etc.
        },
      });
      setConteudo(data.data);
    } catch (error) {
      console.error("Erro ao carregar conteúdo:", error);
      alert("Erro ao carregar o conteúdo.");
    } finally {
      setLoading(false);
    }
  };

  const getTextClass = () => {
    let classes = '';
    if (themeOptions?.fontSize === 1.2) classes += ' text-lg';
    if (themeOptions?.fontSize === 1.4) classes += ' text-xl';
    if (themeOptions?.simpleMode) classes += ' uppercase';
    return classes;
  };

  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-[#F6F8FB] text-[#222]';
  const cardBgClass = theme === 'dark' ? 'bg-gray-900 border-2' : 'bg-white';
  const descriptionColor = theme === 'dark' ? 'text-white' : 'text-[#53575a]';

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
    <div className={`${bgClass} flex flex-col justify-between transition`}>
      <main className={`flex-1 flex flex-col items-center px-5 pt-4 pb-2 ${getTextClass()}`}>
        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-col gap-3">
            <div className={`${cardBgClass} rounded-2xl p-4 shadow-sm flex items-center gap-3`}>
              <div className="flex flex-col flex-1">
                <span className={`font-semibold text-[#253858] ${theme === 'dark' ? 'text-white' : ''} text-base ${getTextClass()}`}>
                  {conteudo.title}
                </span>
                <span className={`text-sm mt-3 ${descriptionColor}`}>
                  {conteudo.summary}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
