import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import { ScrollToTop } from "./components/common/ScrollToTop";
// import Home from "./pages/Dashboard/Home";
import Home from "./pages/Auth/Home";
import AuditivaHome from "./pages/Experiences/Auditiva/Home";
import AuditivaMateria from "./pages/Experiences/Auditiva/Materia";
import AuditivaContentMenu from "./pages/Experiences/Auditiva/ContentMenu";
import AuditivaResume from "./pages/Experiences/Auditiva/Resume";
import AuditivaExtras from "./pages/Experiences/Auditiva/Extras";
import AuditivaQuestions from "./pages/Experiences/Auditiva/Questions";
// import { useContext } from "react";
// import { AuthContext } from "./context/AuthProvider";
import AuthLayout from "./layout/AuthLayout";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthProvider";
import AuditivaRoutes from "./routes/AuditivaRoutes";
import VisualRoutes from "./routes/VisualRoutes";
import IntelectualRoutes from "./routes/IntelectualRoutes";
import MotoraRoutes from "./routes/MotoraRoutes";
import AppLayout from "./layout/AppLayout";
import UserProfiles from "./pages/UserProfiles";
import Disciplinas from "./pages/Admin/Teacher/Disciplinas/Disciplinas";
import DisciplinaDetails from "./pages/Admin/Teacher/Disciplinas/DisciplinaDetails";
import EditConteudo from "./pages/Admin/Conteudos/EditConteudo";
import ResponsavelRoutes from "./routes/ResponsavelRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import ManagerRoutes from "./routes/ManagerRoutes";

export default function App() {


  const { role, token, setAccessibilityType, accessibilityType, authenticated } = useContext(AuthContext);

  useEffect(() => {
    if(!token){
      setAccessibilityType("");
    }
  }, [token])
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {!authenticated ? 
            <Route element={<AuthLayout />}>
              <Route index path="" element={<Home />} />
            </Route>
            :
            <>
              {role == 'student' && 
              <>
                {accessibilityType === "auditiva" && <Route index path="/*" element={<AuditivaRoutes />}/>}
                {accessibilityType === "visual" && <Route index path="/*" element={<VisualRoutes />}/>}
                {accessibilityType === "motora" && <Route index path="/*" element={<MotoraRoutes />}/>}
                {accessibilityType === "intelectual" && <Route index path="/*" element={<IntelectualRoutes />}/>}
              </>}

              {role == 'parent' && <Route index path="/*" element={<ResponsavelRoutes />}/>}

              {role == 'teacher' && <Route index path="/*" element={<TeacherRoutes />}/>}

              {role == 'manager' && <Route index path="/*" element={<ManagerRoutes />}/>}

              
            </>
          }
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}
