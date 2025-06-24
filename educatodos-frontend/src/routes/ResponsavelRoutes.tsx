import { Route, Routes } from "react-router";
import ResponsavelHome from "../pages/Experiences/Responsavel/Home";
import ExperienceVisualLayout from "../pages/Experiences/ExperienceVisualLayout";
import ExperienceLayout from "../pages/Experiences/ExperienceLayout";

export default function ResponsavelRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<ExperienceLayout />}>
        <Route path="" element={<ResponsavelHome />} />
      </Route>

    </Routes>
  );
}