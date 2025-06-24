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
    <div className="bg-[#F6F8FB] flex flex-col h-full w-full">
      <main className="flex-1 flex flex-col items-center px-3 pt-4 pb-3">

        <section className="w-full flex-1 flex flex-col">
          <Question
          />
        </section>

      </main>
    </div>
  );
}