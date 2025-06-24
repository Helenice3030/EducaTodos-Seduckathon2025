import { Navigate, Route, Routes } from "react-router";
import ResponsavelHome from "../pages/Experiences/Responsavel/Home";
import ExperienceVisualLayout from "../pages/Experiences/ExperienceVisualLayout";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";
import AppLayout from "../layout/AppLayout";
import DisciplinaDetails from "../pages/Admin/Teacher/Disciplinas/DisciplinaDetails";
import EditConteudo from "../pages/Admin/Teacher/Conteudos/EditConteudo";
import UserProfiles from "../pages/UserProfiles";
import Professores from "../pages/Admin/Manager/Professores/Professores";
import Disciplinas from "../pages/Admin/Manager/Disciplinas/Disciplinas";
import EditDisciplina from "../pages/Admin/Manager/Disciplinas/EditDisciplina";
import EditProfessor from "../pages/Admin/Manager/Professores/EditProfessor";
import Alunos from "../pages/Admin/Manager/Alunos/Alunos";
import EditAluno from "../pages/Admin/Manager/Alunos/EditAluno";
import Feedbacks from "../pages/Admin/Manager/Feedbacks/Feedbacks";
import Denuncias from "../pages/Admin/Manager/Feedbacks/Denuncias";
import DenunciasAnonimas from "../pages/Admin/Manager/Feedbacks/DenunciasAnonimas";
import AvisosHorarios from "../pages/Admin/Manager/Horarios/Horarios";
import Responsaveis from "../pages/Admin/Manager/Responsaveis/Responsaveis";
import Turmas from "../pages/Admin/Manager/Turmas/Turmas";
import EditTurma from "../pages/Admin/Manager/Turmas/EditTurma";

export default function ManagerRoutes() {
  return (
    <Routes>
      <Route path="" element={<Navigate to={"/admin/disciplinas"} />} />
      <Route path="admin" element={<AppLayout />}>
      {/* <Route index path="" element={<Home />} /> */}

        <Route path="/admin/turmas" element={<Turmas />} />
        <Route path="/admin/turmas/:id" element={<EditTurma />} />

        <Route path="/admin/disciplinas" element={<Disciplinas />} />
        <Route path="/admin/disciplinas/:id" element={<EditDisciplina />} />

        <Route path="/admin/professores" element={<Professores />} />
        <Route path="/admin/professores/:id" element={<EditProfessor />} />

        <Route path="/admin/alunos" element={<Alunos />} />
        <Route path="/admin/alunos/:id" element={<EditAluno />} />

        <Route path="/admin/horarios" element={<AvisosHorarios />} />
        <Route path="/admin/feedbacks" element={<Feedbacks />} />
        <Route path="/admin/denuncias" element={<Denuncias />} />
        <Route path="/admin/denuncias-anonimas" element={<DenunciasAnonimas />} />


        {/* Others Page */}
        <Route path="/admin/profile" element={<UserProfiles />} />

    </Route>

    </Routes>
  );
}