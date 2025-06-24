// src/pages/auditiva/HomePage.tsx

import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";

import {
  FaFile,
} from 'react-icons/fa6';

import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import VerticalCarousel from "../../../components/experiences/visual/VerticalCarousel";
import { speak } from "../../../services/utils";
import useLongClick from "../../../hooks/useLongClick";
import { AuthContext } from "../../../context/AuthProvider";
import api from "../../../services/api";
import Spinner from "../../../components/common/Spinner";

export default function Materia() {
  const { disciplinaId } = useParams();
  const navigate = useNavigate();

  const { setHeaderOptions } = useOutletContext();
  const { themeOptions } = useContext(AuthContext);

  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disciplina, setDisciplina] = useState();

  useEffect(() => {
    fetchConteudos();
  }, [disciplinaId]);

  const fetchConteudos = async () => {
    if (!disciplinaId) return;
    setLoading(true);
    try {
      const [conteudosRes, disciplinaRes] = await Promise.all([
        api.get(`/student/disciplinas/${disciplinaId}/conteudos`),
        api.get(`/student/disciplinas/${disciplinaId}`)
      ]);

      setDisciplina(disciplinaRes.data.data);

      const mapped = conteudosRes.data.data.map((conteudo) => ({
        id: conteudo.id,
        nome: conteudo.title,
        descricao: conteudo.description,
        onClick: () => navigate(`/materias/${disciplinaId}/conteudos/${conteudo.id}`)
      }));
      setConteudos(mapped);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeaderOptions({
      custom: true,
      icon: <FaFile />,
      color: '#465fff',
      title: 'Conteúdos',
      desc: disciplina?.name,
    });
  }, [disciplina]);

  const handleSwipe = (index: number) => {
    if (!conteudos[index]) return;
    speak(conteudos[index].nome + '. ' + conteudos[index]?.descricao);
  };

  useLongClick(() => {
    speak(`Você está vendo conteúdos de ${disciplina.name}`);
  }, { ms: 800 });

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <main className="flex-1 flex flex-col items-center px-3 pt-4 pb-3">
        <section className="w-full flex-1 flex flex-col">
          <div className="flex flex-row items-center justify-between mb-4">
            <h3 className={`text-base font-bold text-[#233366] dark:text-white ${getTextClass()}`}>
              Conteúdos
            </h3>
          </div>
          <div className="flex flex-col w-full flex-1 gap-3">
            {loading ? (
              <Spinner />
            ) : conteudos.length > 0 ? (
              <VerticalCarousel canGoBack={true} items={conteudos} onSwipe={handleSwipe} />
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-white">
                Nenhum conteúdo disponível.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
