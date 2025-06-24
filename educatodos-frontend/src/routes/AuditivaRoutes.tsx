import { Route, Routes } from "react-router";
import AuditivaHome from "../pages/Experiences/Auditiva/Home";
import AuditivaMateria from "../pages/Experiences/Auditiva/Materia";
import AuditivaContentMenu from "../pages/Experiences/Auditiva/ContentMenu";
import AuditivaResume from "../pages/Experiences/Auditiva/Resume";
import AuditivaExtras from "../pages/Experiences/Auditiva/Extras";
import AuditivaQuestions from "../pages/Experiences/Auditiva/Questions";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";

export default function AuditivaRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ExperienceLayout />}>
        <Route path="" element={<AuditivaHome />} />
        <Route path="materias/:disciplinaId/conteudos" element={<AuditivaMateria />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo" element={<AuditivaContentMenu />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/resumo" element={<AuditivaResume />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/extras" element={<AuditivaExtras />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/questoes" element={<AuditivaQuestions />} />
      </Route>

    </Routes>
  );
}