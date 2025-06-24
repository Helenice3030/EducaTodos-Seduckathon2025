import { Navigate, Route, Routes } from "react-router";
import ResponsavelHome from "../pages/Experiences/Responsavel/Home";
import ExperienceVisualLayout from "../pages/Experiences/ExperienceVisualLayout";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";
import AppLayout from "../layout/AppLayout";
import Disciplinas from "../pages/Admin/Teacher/Disciplinas/Disciplinas";
import DisciplinaDetails from "../pages/Admin/Teacher/Disciplinas/DisciplinaDetails";
import EditConteudo from "../pages/Admin/Teacher/Conteudos/EditConteudo";
import UserProfiles from "../pages/UserProfiles";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="" element={<Navigate to={"/admin/disciplinas"} />} />
      <Route path="admin" element={<AppLayout />}>
      {/* <Route index path="" element={<Home />} /> */}

        <Route path="/admin/disciplinas" element={<Disciplinas />} />
        <Route path="/admin/disciplinas/:disciplinaId" element={<DisciplinaDetails />} />
        <Route path="/admin/disciplinas/:disciplinaId/conteudos/:id" element={<EditConteudo />} />


        {/* Others Page */}
        <Route path="/admin/profile" element={<UserProfiles />} />

    </Route>

    </Routes>
  );
}