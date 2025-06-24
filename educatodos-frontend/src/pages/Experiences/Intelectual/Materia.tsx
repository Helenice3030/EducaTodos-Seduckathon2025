import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import {
  FaFaceSmile,
  FaFile,
} from "react-icons/fa6";
import Footer from "../../../components/common/Footer";
import { AuthContext } from "../../../context/AuthProvider";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Materia() {
  const { disciplinaId } = useParams();
  const [conteudos, setConteudos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { setHeaderOptions } = useOutletContext();
  const { themeOptions } = useContext(AuthContext);
  const { theme } = useTheme();

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile />,
      color: "#465fff",
      title: "Conteúdos",
      desc: "Português", // Você pode trocar por o nome real da disciplina se necessário
    });
  }, []);

  useEffect(() => {
    if (disciplinaId) {
      fetchConteudos();
    }
  }, [disciplinaId]);

  const fetchConteudos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/student/disciplinas/${disciplinaId}/conteudos`);
      setConteudos(data.data);
    } catch (error) {
      console.error("Erro ao carregar conteúdos:", error);
      alert("Erro ao carregar conteúdos.");
    } finally {
      setLoading(false);
    }
  };

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

  const descriptionColor = theme === "dark" ? "text-gray-400" : "text-[#7B8794]";

  return (
    <div className={`${bgClass} flex flex-col justify-between transition`}>
      <main className={`flex-1 flex flex-col items-center px-5 pt-4 pb-2 ${getTextClass()}`}>
        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-[#233366]"}`}>
              Conteúdos
            </h3>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-3">
              {conteudos.map(({ id, title, description }) => (
                <div
                  key={id}
                  onClick={() => navigate(`/materias/${disciplinaId}/conteudos/${id}`)}
                  className={`${cardBgClass} rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer`}
                >
                  <div className="flex flex-col text-center flex-1">
                    <FaFaceSmile className="self-center text-blue-300 text-2xl mb-3" />
                    <span className={`font-semibold text-base ${theme === "dark" ? "text-white" : "text-[#253858]"} ${getTextClass()}`}>
                      {title}
                    </span>
                    <span className={`text-xs ${descriptionColor}`}>
                      {description}
                    </span>
                  </div>
                </div>
              ))}
              {conteudos.length === 0 && (
                <p className="text-center text-sm text-gray-500">Nenhum conteúdo disponível.</p>
              )}
            </div>
          )}
        </section>

        <div className={`mt-6 text-sm text-[#4F5B69] dark:text-white text-center ${getTextClass()}`}>
          ✨ <strong>Você consegue!</strong> Estamos aqui para te ajudar. 💙
        </div>
      </main>

      <Footer />
    </div>
  );
}
