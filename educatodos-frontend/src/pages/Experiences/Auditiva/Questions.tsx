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
  FaQuestion
} from 'react-icons/fa6';
import { useEffect, useState } from "react";
import Question from "./Question";
import { useOutletContext } from "react-router";

const materias = [
  {
    nome: 'Resumo: Capítulo 2 – Comunicação Oral e Escrita',
    descricao: 'Neste capítulo, você aprenderá sobre as diferenças entre a comunicação oral e escrita, como se expressar melhor em diferentes situações e a importância do contexto na linguagem. A comunicação oral envolve conversas, debates e apresentações, enquanto a escrita está presente em redações, bilhetes e textos formais.',
  },
];

const questions = [
  {
    question: "O que é comunicação oral?",
    options: [
      "Falar, conversar ou apresentar ideias com a voz.",
      "Escrever textos em um caderno.",
      "Desenhar figuras para se comunicar."
    ],
    answer: 0
  },
  {
    question: "Qual é o principal objetivo da comunicação escrita?",
    options: [
      "Ouvir músicas.",
      "Registrar ideias para serem lidas depois.",
      "Falar em público."
    ],
    answer: 1
  },
  {
    question: "Onde usamos mais a comunicação oral?",
    options: [
      "Em conversas e apresentações.",
      "Ao escrever cartas.",
      "Ao desenhar no quadro."
    ],
    answer: 0
  }
];

export default function Questions({ icone = <FaQuestion />, cor = '#ED5555'}) {

  const [materiaLibras, setMateriaLibras] = useState(null);

  const abrirLibras = (nome) => setMateriaLibras(nome);
  const fecharLibras = () => setMateriaLibras(null);

  const { setHeaderOptions } = useOutletContext();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      color: cor,
      icon: icone,
      title: 'Questões',
      desc: 'Teste seu conhecimento'
    });
  }, []);

  return (
    <div className="bg-[#F6F8FB] flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">
        <section className="w-full max-w-xs flex flex-col">
          <Question
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
