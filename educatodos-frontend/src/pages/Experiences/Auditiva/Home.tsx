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
  FaEyeSlash
} from 'react-icons/fa6';
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";

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

  const [materiaLibras, setMateriaLibras] = useState(null);

  const abrirLibras = (nome) => setMateriaLibras(nome);

  const { setHeaderOptions } = useOutletContext();

  useEffect(() => {
    setHeaderOptions({
      custom: false,
      back: false
    });
  }, []);

  const navigate = useNavigate();
  return (
    <div className="bg-[#F6F8FB] flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">

        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#233366]">Matérias</h3>
          </div>
          <div className="flex flex-col gap-3">
          {materias.map(({ id, nome, cor, icone }) => (
              <div onClick={() => navigate(`/materias/${id}/conteudos`)} key={id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${cor}1A`, color: cor }}>
                  {icone}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-[#253858] text-base">{nome}</span>
                </div>
                <button
                  className="ml-3 flex items-center gap-1 px-2 py-1 rounded-md text-[#21C87A] bg-[#21C87A]/10 text-xs font-semibold active:bg-[#21C87A]/20"
                  onClick={() => abrirLibras(nome)}
                >
                  <FaHandSparkles /> Libras
                </button>
                <button className="ml-2 text-[#A0AEC0] text-lg active:scale-90 transition">
                  <FaChevronRight />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center mt-4">
          <span className="text-xs text-[#4F5B69] mb-1 text-center">
            Toque no botão lateral para assistir à explicação em Língua Brasileira de Sinais.
          </span>
        </section>
      </main>

      <Footer />
    </div>
  );
}

