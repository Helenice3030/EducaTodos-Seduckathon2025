import { Outlet } from "react-router";
import Header from "../pages/Auth/Header";

const LayoutContent: React.FC = () => {
  return (
    <div className="mb-5">
      <Header />
      <div>
        
      </div>
    </div>
  );
};

const AuthLayout: React.FC = () => {

  // const { authenticated } = useContext(AuthContext);

  // if(!authenticated) return <Navigate to="/login" replace />

  return (
    <>
      <Outlet />
    </>
  );
};

export default AuthLayout;
