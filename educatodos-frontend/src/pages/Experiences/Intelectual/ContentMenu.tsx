import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import {
  FaChevronRight,
  FaFileLines,
  FaFolderOpen,
  FaQuestion,
  FaFile,
} from "react-icons/fa6";
import Footer from "../../../components/common/Footer";
import { AuthContext } from "../../../context/AuthProvider";
import { useTheme } from "../../../context/ThemeContext";

const materias = [
  {
    id: "resumo",
    nome: "Resumo",
    descricao: "Principais pontos",
    cor: "#2F80ED",
    icone: <FaFileLines />,
  },
  {
    id: "extras",
    nome: "Materiais",
    descricao: "Apostilas e vídeos",
    cor: "#21C87A",
    icone: <FaFolderOpen />,
  },
  {
    id: "questoes",
    nome: "Questões",
    descricao: "Pratique com exercícios",
    cor: "#ED5555",
    icone: <FaQuestion />,
  },
];

export default function Materia() {
  const { setHeaderOptions } = useOutletContext();
  const navigate = useNavigate();

  const { themeOptions } = useContext(AuthContext);
  const { theme } = useTheme();

  const { disciplinaId, conteudo } = useParams();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile />,
      color: "#465fff",
      title: "Conteúdos",
      desc: '',
    });
  }, []);

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  const bgClass =
    theme === "dark" ? "bg-black text-white" : "bg-[#F6F8FB] text-[#222]";
  const cardBgClass = theme === "dark" ? "bg-gray-900 border-2" : "bg-white";
  const descriptionColor = theme === "dark" ? "text-gray-400" : "text-[#4F5B69]";

  return (
    <div className={`${bgClass} min-h-screen flex flex-col justify-between transition`}>
      <main className={`flex-1 flex flex-col items-center px-5 pt-4 pb-2 ${getTextClass()}`}>
        <section className="w-full max-w-sm flex flex-col">
          <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#233366]"} ${getTextClass()}`}>
            Escolha um conteúdo
          </h2>

          <div className="flex flex-col gap-5">
            {materias.map(({ id, nome, descricao, cor, icone }) => (
              <SubjectButton
                key={id}
                title={nome}
                subtitle={descricao}
                onClick={() => navigate(`/materias/${disciplinaId}/conteudos/${conteudo}/${id}`)}
                color={cor}
                icon={icone}
                theme={theme}
                cardBgClass={cardBgClass}
                descriptionColor={descriptionColor}
                getTextClass={getTextClass}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SubjectButton({
  icon,
  onClick,
  color,
  title,
  subtitle,
  theme,
  cardBgClass,
  descriptionColor,
  getTextClass,
}: any) {
  return (
    <div
      onClick={onClick}
      className={`${cardBgClass} rounded-3xl p-5 shadow-md flex items-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-95 transition`}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl text-3xl shrink-0"
        style={{ backgroundColor: `${color}1A`, color: color }}
      >
        {icon}
      </div>
      <div className="flex flex-col flex-1">
        <span
          className={`font-bold text-[#253858] text-lg ${theme === "dark" ? "text-white" : ""} ${getTextClass()}`}
        >
          {title}
        </span>
        <span className={`text-sm ${descriptionColor} ${getTextClass()}`}>
          {subtitle}
        </span>
      </div>
      <div className="ml-2 text-[#A0AEC0] text-xl">
        <FaChevronRight />
      </div>
    </div>
  );
}
