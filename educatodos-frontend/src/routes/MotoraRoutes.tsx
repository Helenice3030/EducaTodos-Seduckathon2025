import { Route, Routes } from "react-router";
import MotoraHome from "../pages/Experiences/Motora/Home";
import MotoraMateria from "../pages/Experiences/Motora/Materia";
import MotoraContentMenu from "../pages/Experiences/Motora/ContentMenu";
import MotoraResume from "../pages/Experiences/Motora/Resume";
import MotoraExtras from "../pages/Experiences/Motora/Extras";
import MotoraQuestions from "../pages/Experiences/Motora/Questions";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";

export default function MotoraRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ExperienceLayout />}>
        <Route path="" element={<MotoraHome />} />
        <Route path="materias/:disciplinaId/conteudos" element={<MotoraMateria />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo" element={<MotoraContentMenu />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/resumo" element={<MotoraResume />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/extras" element={<MotoraExtras />} />
        <Route path="materias/:disciplinaId/conteudos/:conteudo/questoes" element={<MotoraQuestions />} />
      </Route>

    </Routes>
  );
}