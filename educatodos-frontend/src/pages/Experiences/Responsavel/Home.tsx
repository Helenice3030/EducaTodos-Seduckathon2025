import { useEffect, useState } from "react";
import { 
  FaCalculator, FaBook, FaFlask 
} from "react-icons/fa6";
import { useOutletContext } from "react-router";
import api from "../../../services/api";

export default function Home() {
  const { setHeaderOptions } = useOutletContext();

  const [aluno, setAluno] = useState(null);
  const [frequencia, setFrequencia] = useState("-");
  const [disciplinas, setDisciplinas] = useState([]);
  const [pendencias, setPendencias] = useState([]);

  useEffect(() => {
    setHeaderOptions({ hide: true, back: false });
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: alunosData } = await api.get("/parent/alunos");
      const alunoSelecionado = alunosData.data[0];
      setAluno(alunoSelecionado);

      const [disciplinasRes, frequenciaRes, pendenciasRes] = await Promise.all([
        api.get(`/parent/alunos/${alunoSelecionado.id}/disciplinas`),
        api.get(`/parent/alunos/${alunoSelecionado.id}/frequencia?periodo=ano_letivo`),
        api.get(`/parent/alunos/${alunoSelecionado.id}/pendencias`),
      ]);

      setDisciplinas(disciplinasRes.data.data);
      setFrequencia(frequenciaRes.data.data.resumo_geral.percentual_frequencia || "0%");
      setPendencias(pendenciasRes.data.data.pendencias_ativas.total_questoes_pendentes || 0);
    } catch (error) {
      console.error("Erro ao carregar dados do responsável:", error);
    }
  };

  return (
    <main className="flex-1 px-5 py-4 overflow-y-auto">
      {aluno && (
        <section className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#233366]">
                Aluno: {aluno.name}
              </h3>
              <span className="text-xs text-[#6D7B97]">{aluno?.turma?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <InfoCard label="Disciplinas" value={disciplinas.length} color="green" />
            <InfoCard label="Frequência" value={frequencia} color="blue" />
            <InfoCard label="Pendências" value={pendencias} color="yellow" />
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <h3 className="text-base font-semibold text-[#233366] mb-3">
          Disciplinas
        </h3>
        <div className="space-y-3">
          {disciplinas.slice(0, 3).map((disciplina, i) => (
            <SubjectCard
              key={disciplina.id}
              title={disciplina.name}
              icon={getDiscIcon(i)}
              color={getDiscColor(i)}
              grade={disciplina.stats.respostas_corretas+'/'+disciplina.stats.total_questoes}
              description={'Prof. ' + disciplina.teacher.name}
            />
          ))}
        </div>
      </section>

      {pendencias.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h3 className="text-base font-semibold text-[#233366] mb-3">
            Pendências por Disciplina
          </h3>
          <div className="space-y-3">
            {pendencias.map((item, i) => (
              <SubjectCard
                key={i}
                title={item.disciplina}
                icon={getDiscIcon(i)}
                color={getDiscColor(i)}
                grade={`${item.quantidade} pendência(s)`}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const getDiscIcon = (index) => {
  const icons = [
    <FaCalculator className="text-[#30C185]" />,
    <FaBook className="text-[#3653B4]" />,
    <FaFlask className="text-[#F6B800]" />,
  ];
  return icons[index % icons.length];
};

const getDiscColor = (index) => {
  const colors = ["green", "blue", "yellow"];
  return colors[index % colors.length];
};

const InfoCard = ({ label, value, color }) => {
  const colors = {
    green: ["#E6F9F1", "#30C185", "#1D6150"],
    blue: ["#E4EDFB", "#3653B4", "#233366"],
    yellow: ["#FFF2CC", "#F6B800", "#987200"],
  };
  const [bg, txt, subt] = colors[color];

  return (
    <div className={`flex-1`} style={{ backgroundColor: bg }}>
      <div className="rounded-lg p-2 text-center">
        <div className="text-sm font-semibold" style={{ color: txt }}>
          {value.toString()}
        </div>
        <span className="text-xs" style={{ color: subt }}>
          {label}
        </span>
      </div>
    </div>
  );
};

const SubjectCard = ({ title, icon, color, grade, description }) => {
  const colors = {
    green: "#30C185",
    blue: "#3653B4",
    yellow: "#F6B800",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-[#F6F8FB] rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center`}
          style={{ backgroundColor: `${colors[color]}20` }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-[#233366]">{title}</div>
          {description && <span className="text-xs text-[#6D7B97]">{description}</span>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold" style={{ color: colors[color] }}>
          {grade}
        </div>
      </div>
    </div>
  );
};
