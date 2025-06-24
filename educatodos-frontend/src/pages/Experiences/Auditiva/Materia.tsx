import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { FaChevronRight, FaFileLines, FaHandSparkles, FaXmark } from "react-icons/fa6";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Materia({ icone = <FaFileLines />,  cor = '#2F80ED' }) {
  const { disciplinaId } = useParams();
  const navigate = useNavigate();
  const { setHeaderOptions } = useOutletContext();

  const [conteudos, setConteudos] = useState<
    { id: number; title: string; description: string }[]
  >([]);
  const [disciplina, setDisciplina] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [materiaLibras, setMateriaLibras] = useState<string | null>(null);

  useEffect(() => {
    if (!disciplinaId) return;
    fetchData();
  }, [disciplinaId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [conteudosRes, disciplinaRes] = await Promise.all([
        api.get(`/student/disciplinas/${disciplinaId}/conteudos`),
        api.get(`/student/disciplinas/${disciplinaId}`)
      ]);

      setConteudos(conteudosRes.data.data);
      setDisciplina(disciplinaRes.data.data);

      setHeaderOptions({
        custom: true,
        title: 'Conteúdos',
        icon: icone,
        color: cor,
        desc: disciplinaRes.data.data.name || ''
      });
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const abrirLibras = (titulo: string) => setMateriaLibras(titulo);
  const fecharLibras = () => setMateriaLibras(null);

  return (
    <div className="bg-[#F6F8FB] min-h-screen flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">
        {loading ? (
          <Spinner />
        ) : (
          <section className="w-full max-w-xs flex flex-col">
            <h3 className="text-base font-bold text-[#233366] mb-4">Conteúdos</h3>
            <div className="flex flex-col gap-3">
              {conteudos.map(({ id, title, description }) => (
                <div
                  key={id}
                  onClick={() =>
                    navigate(`/materias/${disciplinaId}/conteudos/${id}`)
                  }
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-[#253858] text-base">
                      {title}
                    </span>
                    <span className="text-xs text-[#7B8794]">
                      {description}
                    </span>
                  </div>
                  <button
                    className="ml-3 flex items-center gap-1 px-2 py-1 rounded-md text-[#21C87A] bg-[#21C87A]/10 text-xs font-semibold active:bg-[#21C87A]/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirLibras(title);
                    }}
                  >
                    <FaHandSparkles /> Libras
                  </button>
                  <button className="ml-2 text-[#A0AEC0] text-lg active:scale-90 transition">
                    <FaChevronRight />
                  </button>
                </div>
              ))}
              {conteudos.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhum conteúdo disponível.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {materiaLibras && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={fecharLibras}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[90vw] max-w-xs flex flex-col items-center shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-[#A0AEC0] text-xl hover:text-[#ED5555] transition"
              onClick={fecharLibras}
            >
              <FaXmark />
            </button>
            <div className="flex flex-col items-center mb-3">
              <FaHandSparkles className="text-3xl text-[#21C87A] mb-2" />
              <span className="font-semibold text-[#253858] text-lg mb-1">
                Explicação em Libras
              </span>
              <span className="text-xs text-[#7B8794] mb-2">
                {materiaLibras}
              </span>
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
