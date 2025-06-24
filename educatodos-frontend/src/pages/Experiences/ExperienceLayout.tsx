import { Outlet } from "react-router";
import Header from "../../components/common/Header";
import { useContext, useEffect, useRef, useState } from "react";
import autoAnimate from '@formkit/auto-animate'
import { AuthContext } from "../../context/AuthProvider";
import VLibras from "../../components/experiences/auditiva/VLibras";
import LinearHeader from "../../components/common/LinearHeader";

const ExperienceLayout: React.FC = () => {

  const [ headerOptions, setHeaderOptions ] = useState({});
  const parent = useRef(null)

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  const { role, accessibilityType } = useContext(AuthContext);

  return (
    <>
      <div ref={parent} className="h-screen flex flex-col">
        {accessibilityType == 'visual' ?
        <LinearHeader {...headerOptions}/>
        :
        <Header {...headerOptions}/>
        }
        <Outlet context={{setHeaderOptions}} />
      </div>
      <VLibras enabled={accessibilityType == 'auditiva' && role == 'student'} />

    </>
  );
};

export default ExperienceLayout;
