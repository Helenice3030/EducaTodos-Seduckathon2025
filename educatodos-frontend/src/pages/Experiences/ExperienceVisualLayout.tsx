import { Outlet } from "react-router";
import Header from "../../components/common/Header";
import { useContext, useEffect, useRef, useState } from "react";
import autoAnimate from '@formkit/auto-animate'
import { AuthContext } from "../../context/AuthProvider";
import VLibras from "../../components/experiences/auditiva/VLibras";
import LinearHeader from "../../components/common/LinearHeader";

const ExperienceVisualLayout: React.FC = () => {

  const [ headerOptions, setHeaderOptions ] = useState({});
  const parent = useRef(null)

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent])

  const { accessibilityType } = useContext(AuthContext);

  return (
    <>
      <div ref={parent} className="h-screen flex flex-col">
        <LinearHeader {...headerOptions}/>
        <div className="flex-1">
          <Outlet context={{setHeaderOptions}} />
        </div>
      </div>
      <VLibras enabled={accessibilityType == 'auditiva'} />

    </>
  );
};

export default ExperienceVisualLayout;
