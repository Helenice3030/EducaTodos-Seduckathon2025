import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";

import Button from "../../../../components/ui/button/Button";
import Spinner from "../../../../components/common/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import api from "../../../../services/api";

const diasSemana = [
  { label: "Segunda", value: "segunda" },
  { label: "Terça", value: "terca" },
  { label: "Quarta", value: "quarta" },
  { label: "Quinta", value: "quinta" },
  { label: "Sexta", value: "sexta" },
  { label: "Sábado", value: "sabado" },
];

interface Turma {
  id: number;
  nome: string;
}

interface Horario {
  id: number;
  disciplina_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface Aviso {
  id: number;
  title: string;
  description: string;
}

export default function AvisosHorarios() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState<string>("");

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [novoAviso, setNovoAviso] = useState({
    titulo: "",
    descricao: "",
  });

  const [novoHorario, setNovoHorario] = useState({
    disciplina: "",
    horarioInicio: "",
    horarioFim: "",
    dia: diasSemana[0].value,
  });

  const fetchTurmas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/turmas");
      console.log(data)
      setTurmas(data.data.turmas);
      if (data.data.turmas.length > 0) {
        setTabAtiva(String(data.data.turmas[0].id));
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar turmas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDados = async (turmaId: string) => {
    if (!turmaId) return;
    setLoading(true);
    try {
      const [avisosRes, horariosRes] = await Promise.all([
        api.get(`/manager/avisos?turma_id=${turmaId}`),
        api.get(`/manager/grade-horarios?turma_id=${turmaId}`),
      ]);
      setAvisos(avisosRes.data.data.avisos);
      setHorarios(horariosRes.data.data.grade_horarios);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (tabAtiva) {
      fetchDados(tabAtiva);
      resetFormularios();
    }
  }, [tabAtiva]);

  const resetFormularios = () => {
    setNovoAviso({ titulo: "", descricao: "" });
    setNovoHorario({
      disciplina: "",
      horarioInicio: "",
      horarioFim: "",
      dia: diasSemana[0].value,
    });
  };

  const adicionarAviso = async () => {
    if (!novoAviso.titulo.trim() || !novoAviso.descricao.trim()) return;
    try {
      const { data } = await api.post("/manager/avisos", {
        turma_id: parseInt(tabAtiva),
        title: novoAviso.titulo.trim(),
        description: novoAviso.descricao.trim(),
      });
      console.log(data)
      setAvisos([...avisos, data.data]);
      setNovoAviso({ titulo: "", descricao: "" });
    } catch (e) {
      console.error(e);
      alert("Erro ao adicionar aviso.");
    }
  };

  const removerAviso = async (id: number) => {
    try {
      await api.delete(`/manager/avisos/${id}`);
      setAvisos(avisos.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao remover aviso.");
    }
  };

  const adicionarHorario = async () => {
    const { disciplina, horarioInicio, horarioFim, dia } = novoHorario;
    if (!disciplina.trim() || !horarioInicio.trim() || !horarioFim.trim()) return;

    try {
      const { data } = await api.post("/manager/grade-horarios", {
        turma_id: parseInt(tabAtiva),
        disciplina_name: disciplina.trim(),
        day_of_week: dia,
        start_time: horarioInicio.trim(),
        end_time: horarioFim.trim(),
      });
      setHorarios([...horarios, data.data]);
      resetFormularios();
    } catch (e) {
      console.error(e);
      alert("Erro ao adicionar horário.");
    }
  };

  const removerHorario = async (id: number) => {
    try {
      await api.delete(`/manager/grade-horarios/${id}`);
      setHorarios(horarios.filter((h) => h.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao remover horário.");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Avisos e Horários por Turma" />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex gap-2 border-b border-gray-200 dark:border-white/[0.05] mb-6">
            {turmas.map((turma) => (
              <button
                key={turma.id}
                onClick={() => setTabAtiva(String(turma.id))}
                className={`px-4 py-2 rounded-t-md border-b-2 ${
                  tabAtiva === String(turma.id)
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                {turma.name}
              </button>
            ))}
          </div>

          {turmas.map((turma) => (
            tabAtiva === String(turma.id) &&
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-5 mb-8 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Avisos da turma {turma.nome}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Título do Aviso"
                    value={novoAviso.titulo}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, titulo: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Descrição"
                    value={novoAviso.descricao}
                    onChange={(e) =>
                      setNovoAviso({ ...novoAviso, descricao: e.target.value })
                    }
                  />
                  <Button onClick={adicionarAviso}>
                    <FaPlus /> Adicionar Aviso
                  </Button>
                </div>

                <div className="space-y-3">
                  {avisos.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhum aviso cadastrado.</p>
                  )}
                  {avisos.map((aviso) => (
                    <div
                      key={aviso.id}
                      className="flex items-start justify-between bg-gray-50 dark:bg-white/5 rounded-md px-4 py-3"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {aviso.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {aviso.description}
                        </p>
                      </div>
                      <button
                        onClick={() => removerAviso(aviso.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remover"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade de Horários */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Grade de Horários - {turma.nome}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Disciplina"
                    value={novoHorario.disciplina}
                    onChange={(e) =>
                      setNovoHorario({ ...novoHorario, disciplina: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Início (ex.: 08:00)"
                    value={novoHorario.horarioInicio}
                    onChange={(e) =>
                      setNovoHorario({ ...novoHorario, horarioInicio: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2"
                    placeholder="Fim (ex.: 09:40)"
                    value={novoHorario.horarioFim}
                    onChange={(e) =>
                      setNovoHorario({ ...novoHorario, horarioFim: e.target.value })
                    }
                  />
                  <select
                    className="border rounded-md px-3 py-2"
                    value={novoHorario.dia}
                    onChange={(e) =>
                      setNovoHorario({ ...novoHorario, dia: e.target.value })
                    }
                  >
                    {diasSemana.map((dia) => (
                      <option key={dia.value} value={dia.value}>
                        {dia.label}
                      </option>
                    ))}
                  </select>
                  <Button onClick={adicionarHorario}>
                    <FaPlus /> Adicionar Horário
                  </Button>
                </div>

                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell isHeader>Horário</TableCell>
                        {diasSemana.map((dia) => (
                          <TableCell isHeader key={dia.value} className="text-center">
                            {dia.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {Array.from(
                        new Set(
                          horarios.map((h) => `${h.start_time} - ${h.end_time}`)
                        )
                      ).map((intervalo) => (
                        <TableRow key={intervalo}>
                          <TableCell className="font-medium">{intervalo}</TableCell>
                          {diasSemana.map((dia) => {
                            const aulas = horarios.filter(
                              (h) =>
                                `${h.start_time} - ${h.end_time}` === intervalo &&
                                h.day_of_week === dia.value
                            );
                            return (
                              <TableCell key={dia.value} className="align-top">
                                <div className="flex flex-col gap-2">
                                  {aulas.map((a) => (
                                    <div
                                      key={a.id}
                                      className="flex items-center justify-between rounded-md bg-gray-100 px-2 py-1"
                                    >
                                      <span className="text-sm">
                                        {a.disciplina_name}
                                      </span>
                                      <button
                                        onClick={() => removerHorario(a.id)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Remover"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          ))}
        </>
      )}
    </>
  );
}
