// src/pages/auditiva/HomePage.tsx
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import ReactPlayer from 'react-player'
import {
  FaGraduationCap,
  FaUniversalAccess,
  FaUserGraduate,
  FaPenToSquare,
  FaBookOpen,
  FaSquareRootVariable,
  FaFlaskVial,
  FaLandmark,
  FaEarthAmericas,
  FaHandSparkles,
  FaChevronRight,
  FaXmark,
  FaRegCopyright,
  FaEyeSlash,
  FaFileLines,
  FaFolderOpen,
  FaQuestion,
  FaHands,
  FaGamepad,
  FaHeadphones,
  FaFilePdf,
  FaPlay
} from 'react-icons/fa6';
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import VoiceFooter from "../../../components/experiences/motora/VoiceFooter";

const materias = [
  {
    nome: 'Resumo: Capítulo 2 – Comunicação Oral e Escrita',
    descricao: 'Neste capítulo, você aprenderá sobre as diferenças entre a comunicação oral e escrita, como se expressar melhor em diferentes situações e a importância do contexto na linguagem. A comunicação oral envolve conversas, debates e apresentações, enquanto a escrita está presente em redações, bilhetes e textos formais.',
  },
];

export default function Extras({ icone = <FaFolderOpen />, cor = '#21C87A'}) {

  const [materiaLibras, setMateriaLibras] = useState(null);

  const abrirLibras = (nome) => setMateriaLibras(nome);
  const fecharLibras = () => setMateriaLibras(null);

  const { setHeaderOptions } = useOutletContext();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      color: cor,
      icon: icone,
      title: 'Materiais Complementares',
      desc: 'Comunicação Oral'
    });
  }, []);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFocus, setCurrentFocus] = useState<number>(-1);
  
  const focusItem = (index: number) => {
  const el = itemRefs.current[index];
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentFocus(index);
    }
  };

  const focusNext = () => {
    const next = Math.min(currentFocus + 1, 2 - 1);
    focusItem(next);
  };

  const focusPrev = () => {
    const prev = Math.max(currentFocus - 1, 0);
    focusItem(prev);
  };

  return (
    <div className="bg-[#F6F8FB] flex-1 flex flex-col justify-between">

      <main className="flex-1 flex flex-col items-center px-5 pt-2 pb-2">

        <section className="w-full max-w-xs flex flex-col gap-4 mb-5">
            {/* Video Card */}
            <div ref={el => itemRefs.current[0] = el}
              tabIndex={0} className="w-full bg-white rounded-2xl shadow-lg overflow-hidden focus:ring-2 focus:ring-blue-500">
              <div className="relative">
                <div className="h-40">
                  <ReactPlayer width='100%'
                    height='100%' url='https://www.youtube.com/watch?v=LXb3EKWsInQ' />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[#233366] mb-1">
                  Introdução aos Gêneros Textuais
                </h3>
                <p className="text-xs text-[#6D7B97] mb-3">
                  Vídeo explicativo sobre os principais gêneros textuais na língua portuguesa
                </p>
                {/* <div className="flex items-center justify-between">
                  <button className="bg-[#30C185] px-3 py-1 rounded-lg text-xs font-semibold text-white">
                    Assistir
                  </button>
                </div> */}
              </div>
            </div>
            {/* PDF Card */}
            <MaterialCard
              ref={el => itemRefs.current[1] = el}
              tabIndex={0}
              icon={<FaFilePdf className="text-xl text-[#30C185]" />}
              title="Guia de Redação"
              description="Material em PDF com dicas de escrita"
              // time="12 páginas"
              actionLabel="Baixar"
              onLibrasClick={abrirLibras}
            />

          </section>
      </main>
      <VoiceFooter onScrollUp={focusPrev} onScrollDown={focusNext} />
    </div>
  );
}

function MaterialCard({ icon, title, hasLibras, description, time, actionLabel, onLibrasClick, ...rest }) {
  return (
    <div {...rest} className="w-full bg-white rounded-2xl shadow-lg p-4 focus:ring-2 focus:ring-blue-500">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-[#E6F9F1] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#233366]">{title}</h3>
          <p className="text-xs text-[#6D7B97]">{description}</p>
        </div>
        {hasLibras && <button
          className="ml-3 flex items-center gap-1 px-2 py-1 rounded-md text-[#21C87A] bg-[#21C87A]/10 text-2xl font-semibold active:bg-[#21C87A]/20"
          onClick={() => onLibrasClick()}
        >
          <FaHandSparkles />
        </button>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#A4B1C8]">{time}</span>
        <button className="bg-[#30C185] px-3 py-1 rounded-lg text-xs font-semibold text-white">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
