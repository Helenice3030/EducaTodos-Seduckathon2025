import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import VoiceFooter from "../../../components/experiences/motora/VoiceFooter";
import { FaChevronRight, FaFile } from "react-icons/fa6";
import api from "../../../services/api"; // 👈 seu client Axios

export default function Materia() {
  const { disciplinaId } = useParams(); // 👈 pegar ID da disciplina pela URL
  const [conteudos, setConteudos] = useState([]);
  const [disciplina, setDisciplina] = useState();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentFocus, setCurrentFocus] = useState<number>(-1);
  const navigate = useNavigate();
  const { setHeaderOptions } = useOutletContext();

  // Buscar conteúdos da disciplina
  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        const [conteudosRes, disciplinaRes] = await Promise.all([
        api.get(`/student/disciplinas/${disciplinaId}/conteudos`),
        api.get(`/student/disciplinas/${disciplinaId}`)
      ]);

        setConteudos(conteudosRes.data.data);
        setDisciplina(disciplinaRes.data.data);
        focusItem(0); // foca o primeiro ao carregar
      } catch (err) {
        console.error("Erro ao carregar conteúdos", err);
      }
    };

    fetchConteudos();
  }, [disciplinaId]);

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile />,
      color: '#465fff',
      title: 'Conteúdos',
      desc: disciplina?.name // ou dinamicamente pelo backend
    });
  }, []);

  const handleCommand = (command) => {
    if(conteudos.some(c => c.title.toLowerCase().includes(command))){
      const c = conteudos.find(m => m.title.toLowerCase().includes(command))
      navigate(`/materias/${disciplinaId}/conteudos/${c.id}`)
    }

  }

  const focusItem = (index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentFocus(index);
    }
  };

  const focusNext = () => focusItem(Math.min(currentFocus + 1, conteudos.length - 1));
  const focusPrev = () => focusItem(Math.max(currentFocus - 1, 0));

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
        document.querySelector("#microphone-toggle")?.dispatchEvent(new MouseEvent("click"));
      } else if (e.key === "Enter") {
        e.preventDefault();
        (document.activeElement as HTMLElement)?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFocus]);

  return (
    <div className="bg-[#F6F8FB] flex flex-1 flex-col justify-between">
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-2">
        <section className="w-full max-w-xs flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#233366]">Conteúdos</h3>
          </div>
          <div className="flex flex-col gap-3">
            {conteudos.map(({ id, title, description }, index) => (
              <div
                key={id}
                ref={(el) => (itemRefs.current[index] = el)}
                tabIndex={0}
                onClick={() => navigate(`/materias/${disciplinaId}/conteudos/${id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-[#253858] text-base">{title}</span>
                  <span className="text-xs text-[#7B8794]">{description}</span>
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
