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
  FaWheelchair
} from 'react-icons/fa6';
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import VoiceFooter from "../../../components/experiences/motora/VoiceFooter";
import { useRef } from "react";


const materias = [
  {
    id: 1,
    nome: 'Língua Portuguesa',
    cor: '#2F80ED',
    icone: <FaBookOpen />,
  },
  {
    id: 2,
    nome: 'Matemática',
    cor: '#FFB946',
    icone: <FaSquareRootVariable />,
  },
  {
    id: 3,
    nome: 'História',
    cor: '#ED5555',
    icone: <FaLandmark />,
  },
];

export default function Home() {

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFocus, setCurrentFocus] = useState<number>(-1);

  const { setHeaderOptions } = useOutletContext();

  useEffect(() => {
    setHeaderOptions({
      custom: false,
      back: false,
      accessibility: 'Motora',
      accessibilityIcon: <FaWheelchair />,
      accessibilityDescription: 'Voz e Comandos'
    });
  }, []);

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

  const navigate = useNavigate();
  const handleCommand = (command) => {

    if(materias.some(m => m.nome.toLowerCase().includes(command))){
      const m = materias.find(m => m.nome.toLowerCase().includes(command))
      navigate(`/materias/${m.id}/conteudos`)
    }

  }

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusNext();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusPrev();
    } else if (e.code === "Space") {
      e.preventDefault();
      const micButton = document.querySelector("#microphone-toggle") as HTMLButtonElement;
      micButton?.click();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [currentFocus]);

  return (
    <div className="bg-[#F6F8FB] flex flex-col flex-1 justify-between">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">

        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#233366]">Matérias</h3>
          </div>
          <div className="flex flex-col gap-3">
          {materias.map(({ id, nome, cor, icone }, index) => (
              <div ref={el => itemRefs.current[index] = el} tabIndex={0} onClick={() => navigate(`/materias/${id}/conteudos`)} key={id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 focus:ring-2 focus:ring-blue-500">
                <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${cor}1A`, color: cor }}>
                  {icone}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-[#253858] text-base">{nome}</span>
                </div>
                <button className="ml-2 text-[#A0AEC0] text-lg active:scale-90 transition">
                  <FaChevronRight />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <VoiceFooter onCommand={handleCommand} onScrollUp={focusPrev} onScrollDown={focusNext} />
    </div>
  );
}