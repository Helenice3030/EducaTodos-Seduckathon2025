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
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

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

  return (
    <div className="bg-[#F6F8FB] min-h-screen flex flex-col justify-between">

      <main className="flex-1 flex flex-col items-center px-5 pt-2 pb-2">

        <section className="w-full max-w-xs bg-[#E6F9F1] rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#30C185] rounded-full flex items-center justify-center">
            <FaHands className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-[#1D6150]">
              Modo Acessibilidade Auditiva
            </span>
            <p className="text-xs text-[#6D7B97] mt-1">
              Conteúdos com interpretação em LIBRAS disponível
            </p>
          </div>
        </section>

        <section className="w-full max-w-xs flex flex-col gap-4 mb-5">
            {/* Video Card */}
            <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
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
              icon={<FaFilePdf className="text-xl text-[#30C185]" />}
              title="Guia de Redação"
              description="Material em PDF com dicas de escrita"
              // time="12 páginas"
              actionLabel="Baixar"
              onLibrasClick={abrirLibras}
            />

          </section>
      </main>

      <Footer />

      {materiaLibras && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={fecharLibras}>
          <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-xs flex flex-col items-center shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-[#A0AEC0] text-xl hover:text-[#ED5555] transition" onClick={fecharLibras}>
              <FaXmark />
            </button>
            <div className="flex flex-col items-center mb-3">
              <FaHandSparkles className="text-3xl text-[#21C87A] mb-2" />
              <span className="font-semibold text-[#253858] text-lg mb-1">Explicação em Libras</span>
              <span className="text-xs text-[#7B8794] mb-2">{materiaLibras}</span>
            </div>
            <div className="w-full h-44 rounded-xl bg-[#EAF1FB] flex items-center justify-center overflow-hidden mb-2">
              <img
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/31a4c7ee91-deb763179a2770866fa5.png"
                alt="pessoa gesticulando em libras"
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

function MaterialCard({ icon, title, hasLibras, description, time, actionLabel, onLibrasClick }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-4">
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


function SubjectButton({ icon, bgColor, title, subtitle, chevronColor }: any) {
  return (
    <button
      className={`flex items-center gap-3 ${bgColor} rounded-xl py-3 px-4 focus:ring-2 transition cursor-pointer w-full`}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">{icon}</div>
      <div className="flex flex-col flex-1 items-start">
        <span className="text-base font-semibold text-[#233366]">{title}</span>
        <span className="text-xs text-[#6D7B97]">{subtitle}</span>
      </div>
      <FaChevronRight className={`text-[${chevronColor}]`} />
    </button>
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
