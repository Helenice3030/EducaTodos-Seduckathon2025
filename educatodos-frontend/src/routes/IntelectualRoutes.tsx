import { Route, Routes } from "react-router";
import IntelectualHome from "../pages/Experiences/Intelectual/Home";
import IntelectualMateria from "../pages/Experiences/Intelectual/Materia";
import IntelectualContentMenu from "../pages/Experiences/Intelectual/ContentMenu";
import IntelectualResume from "../pages/Experiences/Intelectual/Resume";
import IntelectualExtras from "../pages/Experiences/Intelectual/Extras";
import IntelectualQuestions from "../pages/Experiences/Intelectual/Questions";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";

export default function IntelectualRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ExperienceLayout />}>
        <Route path="" element={<IntelectualHome />} />
        <Route path="materias/:disciplinaId/conteudos" element={<IntelectualMateria />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo" element={<IntelectualContentMenu />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/resumo" element={<IntelectualResume />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/extras" element={<IntelectualExtras />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/questoes" element={<IntelectualQuestions />} />
      </Route>

    </Routes>
  );
}