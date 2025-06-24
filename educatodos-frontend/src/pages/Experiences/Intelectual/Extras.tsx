import { useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import Footer from "../../../components/common/Footer";
import ReactPlayer from 'react-player';
import {
  FaHandSparkles,
  FaXmark,
  FaFolderOpen,
  FaFilePdf
} from 'react-icons/fa6';
import { AuthContext } from "../../../context/AuthProvider";
import { useTheme } from "../../../context/ThemeContext";

const materias = [
  {
    nome: 'Resumo: Capítulo 2 – Comunicação Oral e Escrita',
    descricao:
      'Neste capítulo, você aprenderá sobre as diferenças entre a comunicação oral e escrita, como se expressar melhor em diferentes situações e a importância do contexto na linguagem. A comunicação oral envolve conversas, debates e apresentações, enquanto a escrita está presente em redações, bilhetes e textos formais.',
  },
];

export default function Extras({ icone = <FaFolderOpen />, cor = '#21C87A' }) {
  const [materiaLibras, setMateriaLibras] = useState<string | null>(null);

  const abrirLibras = (nome: string) => setMateriaLibras(nome);
  const fecharLibras = () => setMateriaLibras(null);

  const { setHeaderOptions } = useOutletContext();
  const { themeOptions } = useContext(AuthContext);
  const { theme } = useTheme();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      color: cor,
      icon: icone,
      title: 'Materiais Complementares',
      desc: 'Comunicação Oral',
    });
  }, []);

  const getTextClass = () => {
    let classes = '';
    if (themeOptions?.fontSize === 1.2) classes += ' text-lg';
    if (themeOptions?.fontSize === 1.4) classes += ' text-xl';
    if (themeOptions?.simpleMode) classes += ' uppercase';
    return classes;
  };

  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-[#F6F8FB] text-[#222]';
  const cardBgClass = theme === 'dark' ? 'bg-gray-900 border-2' : 'bg-white';
  const descriptionColor = theme === 'dark' ? 'text-gray-400' : 'text-[#6D7B97]';

  return (
    <div className={`${bgClass} min-h-screen flex flex-col justify-between transition`}>
      <main className={`flex-1 flex flex-col items-center px-5 pt-2 pb-2 ${getTextClass()}`}>
        <section className="w-full max-w-xs flex flex-col gap-4 mb-5">
          {/* Video Card */}
          <div className={`${cardBgClass} rounded-2xl shadow-lg overflow-hidden`}>
            <div className="relative">
              <div className="h-40">
                <ReactPlayer
                  width="100%"
                  height="100%"
                  url="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                />
              </div>
            </div>
            <div className="p-4">
              <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#233366]'} mb-1`}>
                Introdução aos Gêneros Textuais
              </h3>
              <p className={`text-xs ${descriptionColor} mb-3`}>
                Vídeo explicativo sobre os principais gêneros textuais na língua portuguesa.
              </p>
            </div>
          </div>

          {/* PDF Card */}
          <MaterialCard
            icon={<FaFilePdf className="text-xl text-[#30C185]" />}
            title="Guia de Redação"
            description="Material em PDF com dicas de escrita"
            actionLabel="Baixar"
            onLibrasClick={() => abrirLibras('Guia de Redação')}
            theme={theme}
            themeOptions={themeOptions}
          />
        </section>
      </main>

      <Footer />

      {/* Modal Libras */}
      {materiaLibras && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={fecharLibras}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[90vw] max-w-xs flex flex-col items-center shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-[#A0AEC0] text-xl hover:text-[#ED5555] transition"
              onClick={fecharLibras}
              aria-label="Fechar explicação em Libras"
            >
              <FaXmark />
            </button>
            <div className="flex flex-col items-center mb-3">
              <FaHandSparkles className="text-3xl text-[#21C87A] mb-2" />
              <span className="font-semibold text-[#253858] text-lg mb-1">
                Explicação em Libras
              </span>
              <span className="text-xs text-[#7B8794] mb-2">{materiaLibras}</span>
            </div>
            <div className="w-full h-44 rounded-xl bg-[#EAF1FB] flex items-center justify-center overflow-hidden mb-2">
              <img
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/31a4c7ee91-deb763179a2770866fa5.png"
                alt="Pessoa gesticulando em libras"
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-xs text-[#4F5B69] text-center">
              Assista à explicação desse conteúdo em Libras para melhor compreensão.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔥 Material Card Reutilizável
function MaterialCard({ icon, title, description, actionLabel, onLibrasClick, theme, themeOptions }: any) {
  const getTextClass = () => {
    let classes = '';
    if (themeOptions?.fontSize === 1.2) classes += ' text-lg';
    if (themeOptions?.fontSize === 1.4) classes += ' text-xl';
    if (themeOptions?.simpleMode) classes += ' uppercase';
    return classes;
  };

  const cardBgClass = theme === 'dark' ? 'bg-gray-900 border-2' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#233366]';
  const descriptionColor = theme === 'dark' ? 'text-gray-400' : 'text-[#6D7B97]';

  return (
    <div className={`${cardBgClass} w-full rounded-2xl shadow-lg p-4`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-[#E6F9F1] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${textColor} ${getTextClass()}`}>
            {title}
          </h3>
          <p className={`text-xs ${descriptionColor}`}>{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${descriptionColor}`}>PDF</span>
        <button className="bg-[#30C185] px-3 py-1 rounded-lg text-xs font-semibold text-white">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
