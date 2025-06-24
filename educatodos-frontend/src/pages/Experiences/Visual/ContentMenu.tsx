// src/pages/auditiva/HomePage.tsx
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";

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
  FaFile
} from 'react-icons/fa6';
import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { speak } from "../../../services/utils";
import useLongClick from "../../../hooks/useLongClick";
import VerticalCarousel from "../../../components/experiences/visual/VerticalCarousel";
import { AuthContext } from "../../../context/AuthProvider";


export default function Materia() {

  const { setHeaderOptions } = useOutletContext();

  const [materiaLibras, setMateriaLibras] = useState(null);


  const { disciplinaId, conteudo } = useParams();

  const navigate = useNavigate();
  
  const menu = [
    {
      id: 'resume',
      nome: 'Resumo do conteúdo',
      descricao: 'Principais conceitos, definições e exemplos',
      cor: '#2F80ED',
      icone: <FaFileLines />,
      onClick: () => navigate(`/materias/${disciplinaId}/conteudos/${conteudo}/resumo`)
    },
    {
      id: 'extras',
      nome: 'Materiais Complementares',
      descricao: 'Apostilas, vídeos e links úteis',
      cor: '#21C87A',
      icone: <FaFolderOpen />,
      onClick: () => navigate('/materias/portugues/conteudos/ortografia/extras')
    },
    {
      id: 'questions',
      nome: 'Questões',
      descricao: 'Exercícios e desafios para praticar',
      cor: '#ED5555',
      icone: <FaQuestion />,
      onClick: () => navigate('/materias/portugues/conteudos/ortografia/questoes')
    },
  ];

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile/>,
      color: '#465fff',
      title: 'Conteúdo',
      desc: 'Ortografia'
    });
  }, [])

  const handleSwipe = (index) => {
    speak(menu[index].nome + '. ' + menu[index].descricao);
  }

  useLongClick(() => {
    speak('Você está vendo o menu de conteúdos de português');
    // console.log("Clique longo detectado!");
  }, { ms: 800 });

  const { themeOptions } = useContext(AuthContext);
  
  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <main className="flex-1 flex flex-col items-center px-3 pt-4 pb-3">

        <section className="w-full flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className={`text-base font-bold text-[#233366] dark:text-white ${getTextClass()}`}>Conteúdos</h3>
          </div>
          <div className="flex flex-col w-full flex-1 gap-3">
            <VerticalCarousel canGoBack={true} items={menu} onSwipe={handleSwipe}/>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}

function SubjectButton({ icon, onClick, abrirLibras, color, title, subtitle }: any) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${color}1A`, color: color }}>
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-[#253858] text-base">{title}</span>
        <span className="text-xs text-[#7B8794]">{subtitle}</span>
      </div>
      <button
        className="ml-3 flex items-center gap-1 px-2 py-1 rounded-md text-[#21C87A] bg-[#21C87A]/10 text-2xl font-semibold active:bg-[#21C87A]/20"
        onClick={() => abrirLibras()}
      >
        <FaHandSparkles />
      </button>
      <button className="ml-2 text-[#A0AEC0] text-lg active:scale-90 transition">
        <FaChevronRight />
      </button>
    </div>
  );
}

function LoginOption({ icon, label, bg }: any) {
  return (
    <button
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 ${bg} rounded-xl focus:ring-2 transition cursor-pointer`}
    >
      <div className="text-lg">{icon}</div>
      <span className="text-xs font-medium text-[#233366]">{label}</span>
    </button>
  );
}
