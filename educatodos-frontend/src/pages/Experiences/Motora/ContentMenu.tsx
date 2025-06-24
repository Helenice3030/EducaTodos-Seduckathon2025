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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import VoiceFooter from "../../../components/experiences/motora/VoiceFooter";

const materias = [
  {
    id: 'resume',
    nome: 'Resumo do conteúdo',
    descricao: 'Principais conceitos, definições e exemplos',
    cor: '#2F80ED',
    icone: <FaFileLines />,
  },
  {
    id: 'extras',
    nome: 'Materiais Complementares',
    descricao: 'Apostilas, vídeos e links úteis',
    cor: '#21C87A',
    icone: <FaFolderOpen />,
  },
  {
    id: 'questions',
    nome: 'Questões',
    descricao: 'Exercícios e desafios para praticar',
    cor: '#ED5555',
    icone: <FaQuestion />,
  },
];

export default function Materia() {

  const { setHeaderOptions } = useOutletContext();

  const { disciplinaId, conteudo } = useParams();


  const navigate = useNavigate();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile/>,
      color: '#465fff',
      title: 'Conteúdo',
      desc: 'Ortografia'
    });
  }, [])

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
    const next = Math.min(currentFocus + 1, materias.length - 1);
    focusItem(next);
  };

  const focusPrev = () => {
    const prev = Math.max(currentFocus - 1, 0);
    focusItem(prev);
  };

  const handleCommand = (command) => {
    if(command.includes('resumo')){
      navigate(`/materias/${disciplinaId}/conteudos/${conteudo}/resumo`)
    }
  }

  return (
    <div className="bg-[#F6F8FB] flex flex-1 flex-col justify-between">

      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">

        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#233366]">Conteúdos</h3>
          </div>
          <div className="flex flex-col gap-3">
            <SubjectButton
              title='Resumo do conteúdo'
              ref={el => itemRefs.current[0] = el}
              tabIndex={0}
              subtitle='Principais conceitos, definições e exemplos'
              onClick={() => navigate(`/materias/${disciplinaId}/conteudos/${conteudo}/resumo`)}
              color='#21C87A'
              icon={<FaFolderOpen />}
            />
            <SubjectButton
              title='Materiais Complementares'
              ref={el => itemRefs.current[1] = el}
              tabIndex={0}
              subtitle='Apostilas, vídeos e links úteis'
              onClick={() => navigate('/materias/portugues/conteudos/ortografia/extras')}
              color='#2F80ED'
              icon={<FaFileLines />}
            />
            <SubjectButton
              title='Questões'
              ref={el => itemRefs.current[2] = el}
              tabIndex={0}
              subtitle='Exercícios e desafios para praticar'
              onClick={() => navigate('/materias/portugues/conteudos/ortografia/questoes')}
              color='#ED5555'
              icon={<FaQuestion />}
            />
          </div>
        </section>
      </main>

    <VoiceFooter onCommand={handleCommand} onScrollUp={focusPrev} onScrollDown={focusNext} />

    </div>
  );
}

function SubjectButton({ icon, onClick, abrirLibras, color, title, subtitle, ...rest }: any) {
  return (
    <div {...rest} onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 focus:ring-2 focus:ring-blue-500">
      <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${color}1A`, color: color }}>
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-[#253858] text-base">{title}</span>
        <span className="text-xs text-[#7B8794]">{subtitle}</span>
      </div>
      <button className="ml-2 text-[#A0AEC0] text-lg active:scale-90 transition">
        <FaChevronRight />
      </button>
    </div>
  );
}

