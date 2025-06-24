import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  FaBookOpen,
  FaSquareRootVariable,
  FaFlaskVial,
  FaLandmark,
  FaEarthAmericas,
  FaBrain,
  FaTextHeight,
  FaEyeSlash,
  FaHeading,
} from "react-icons/fa6";
import Footer from "../../../components/common/Footer";
import { FaAdjust, FaUndo } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";
import { AuthContext } from "../../../context/AuthProvider";


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
  const { setHeaderOptions } = useOutletContext();
  const navigate = useNavigate();

  const { theme, setTheme, toggleTheme } = useTheme();

  const { themeOptions, setThemeOptions } = useContext(AuthContext);

  const reset = () => {
    setThemeOptions({
      fontSize: 1,
      simpleMode: false
    });
    setTheme('light');
  };
  
  useEffect(() => {
    setHeaderOptions({
      custom: false,
      back: false,
      accessibility: "Intelectual",
      accessibilityIcon: <FaBrain />,
      accessibilityDescription: "Apoio Cognitivo",
    });
  }, []);

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  return (
    <div className={`flex flex-col justify-between h-screen transition`}>
      <main className={`flex-1 flex flex-col items-center px-4 pt-5 ${getTextClass()}`}>
        {/* 🔧 Ajustes Visuais */}
        <div className="w-full max-w-md bg-white shadow-md rounded-2xl dark:bg-black dark:border-2 p-4 mb-5 flex flex-col gap-2">
          <h3 className="text-base font-bold text-[#233366] dark:text-white mb-2">
            🎛️ Ajustes Visuais
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                setThemeOptions((prev) => ({...prev, fontSize: prev.fontSize < 1.4 ? prev.fontSize + 0.2 : 1.4}))
              }
              className="bg-blue-100 rounded-xl p-3 flex flex-col items-center hover:bg-blue-200"
            >
              <FaTextHeight />
              <span className="text-xs text-center">Aumentar Texto</span>
            </button>

            <button
              onClick={() => setThemeOptions((prev) => ({...prev, simpleMode: !prev.simpleMode}))}
              className="bg-yellow-100 rounded-xl p-3 flex flex-col items-center hover:bg-yellow-200"
            >
              <FaHeading />
              <span className="text-xs text-center">
                {!themeOptions?.simpleMode ? "Maiúsculas" : "Texto Normal"}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="bg-[#000] text-white rounded-xl p-3 flex flex-col items-center hover:bg-gray-800"
            >
              <FaAdjust />
              <span className="text-xs text-center">Contraste</span>
            </button>

            <button
              onClick={reset}
              className="bg-red-100 rounded-xl p-3 flex flex-col items-center hover:bg-red-200 col-span-3"
            >
              <FaUndo />
              <span className="text-xs text-center">Resetar Ajustes</span>
            </button>
          </div>
        </div>

        {/* 🎯 Matérias */}
        <h2 className={`dark:text-white text-2xl font-bold mb-2 text-[#233366] ${getTextClass()}`}>
          Qual matéria você quer estudar?
        </h2>
        <p className={`dark:text-white text-sm text-[#4F5B69] mb-5 text-center ${getTextClass()}`}>
          Toque no botão da matéria para começar! 💡
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {materias.map(({ id, nome, cor, icone }) => (
            <button
              key={id}
              onClick={() => navigate(`/materias/${id}/conteudos`)}
              className={`bg-white dark:bg-black border-2 rounded-2xl p-4 shadow-md flex flex-col items-center justify-center gap-2 hover:bg-[#f2f4f7] transition active:scale-95`}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-xl text-3xl"
                style={{
                  backgroundColor: `${cor}1A`,
                  color: cor,
                }}
              >
                {icone}
              </div>
              <span className={`font-bold text-base text-[#253858] dark:text-white text-center ${getTextClass()}`}>
                {nome}
              </span>
            </button>
          ))}
        </div>

        <div className={`mt-6 text-sm text-[#4F5B69] dark:text-white text-center ${getTextClass()}`}>
          ✨ <strong>Você consegue!</strong> Estamos aqui para te ajudar. 💙
        </div>
      </main>

      <Footer />
    </div>
  );
}
