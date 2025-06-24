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
import { useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import VerticalCarousel from "../../../components/experiences/visual/VerticalCarousel";
import { speak } from "../../../services/utils";
import useLongClick from "../../../hooks/useLongClick";
import { AuthContext } from "../../../context/AuthProvider";

const materias = [
  {
    nome: 'Materiais Complementares',
    descricao: 'Comunicação oral',
  },
];

export default function Extras({ icone = <FaFolderOpen />, cor = '#21C87A'}) {

  const [materiaLibras, setMateriaLibras] = useState(null);

  const abrirLibras = (nome) => setMateriaLibras(nome);
  const fecharLibras = () => setMateriaLibras(null);

  const { setHeaderOptions } = useOutletContext();

  const extras = [
    {
      title: 'Introdução aos Gêneros Textuais',
      description: 'Vídeo explicativo sobre os principais gêneros textuais na língua portuguesa',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      Component: VideoCard
    },
    {
      title: 'Guia de Redação',
      description: 'Material em PDF com dicas de escrita',
      type: 'pdf',
      icon: <FaFilePdf className="text-xl text-[#30C185]" />,
      actionLabel: 'Baixar',
      Component: MaterialCard
    }
  ];

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      color: cor,
      icon: icone,
      title: 'Materiais Complementares',
      desc: 'Comunicação Oral'
    });
  }, []);

  const handleSwipe = (index) => {
    speak(extras[index].title + '. ' + extras[index].description);
  }

  useLongClick(() => {
    speak('Você está na sessão de materiais complementares de conteúdos de português');
    // console.log("Clique longo detectado!");
  }, { ms: 800 });

  return (
    <div className="flex flex-col h-full w-full">
      <main className="flex-1 flex flex-col items-center px-3 pt-4 pb-3">

        <section className="w-full flex-1 flex flex-col">
          <div className="flex flex-col flex-1 w-full gap-3">
            <VerticalCarousel items={extras} canGoBack={true} onSwipe={handleSwipe} />
            {/* PDF Card */}
          </div>

          </section>
      </main>
    </div>
  );
}

function VideoCard({ title, description, url, ...rest }) {

  const { themeOptions } = useContext(AuthContext);

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  return (
    <div {...rest} className="h-full w-full bg-white dark:bg-black rounded-2xl shadow-lg overflow-hidden">
      <div className="relative">
        <div className="h-40">
          <ReactPlayer width='100%'
            height='100%' url={url} />
        </div>
      </div>
      <div className="p-4 pointer-events-none">
        <h3 className={`text-sm font-bold text-[#233366] mb-1 dark:text-amber-300 ${getTextClass()}`}>
          {title}
        </h3>
        <p className={`text-xs text-[#6D7B97] mb-3 dark:text-white ${getTextClass()}`}>
          {description}
        </p>
        {/* <div className="flex items-center justify-between">
          <button className="bg-[#30C185] px-3 py-1 rounded-lg text-xs font-semibold text-white">
            Assistir
          </button>
        </div> */}
      </div>
    </div>
  )
}

function MaterialCard({ icon, title, description, time, actionLabel, onLibrasClick, ...rest }) {
  const { themeOptions } = useContext(AuthContext);

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };
  return (
    <div {...rest} className="h-full w-full bg-white dark:bg-black rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-3 mb-3 pointer-events-none">
        <div className="w-12 h-12 bg-[#E6F9F1] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-bold text-[#233366] dark:text-amber-300 ${getTextClass()}`}>{title}</h3>
          <p className={`text-xs text-[#6D7B97] dark:text-white ${getTextClass()}`}>{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pointer-events-none">
        <span className="text-xs text-[#A4B1C8]">{time}</span>
        <button className="bg-[#30C185] px-3 py-1 rounded-lg text-xs font-semibold text-white">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

