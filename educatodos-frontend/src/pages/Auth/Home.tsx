import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { IoTicketOutline, IoTrophyOutline } from "react-icons/io5";
import { useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import RoleSelection from "./RoleSelection";
import Footer from "./Footer";
import autoAnimate from '@formkit/auto-animate'
import LoginForm from "./LoginForm";
import AccessibilityChoice from "./AccessibilityChoice";
import { AuthContext } from "../../context/AuthProvider";


const STEPS = {
  init: 0,
  login: 1,
  choice: 2
}

export default function Home() {

  const parent = useRef(null)
  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent]);

  const [ step, setStep ] = useState(STEPS.init);

  const handleSelectRole = (r) => {
    setRole(r);
    setStep(STEPS.login);
  }

  const { role, setRole, login, accessibilityType, setAccessibilityType, setToken } = useContext(AuthContext);

  const [ accessToken, setAccessToken ] = useState();

  const handleLogin = async (data: any) => {
    if(role == 'student'){
      const res = await login(data.email, data.password, true)
      setAccessToken(res?.token);
      setStep(STEPS.choice)
    }else{
      login(data.email, data.password)
    }
  }

  useEffect(() => {
    if(accessibilityType){
      setToken(accessToken || '');
      window.location.href = '/';
    }
  }, [accessibilityType])

  return (
    <div className="bg-[#F6F8FB] min-h-[700px]">
      <Header />
      <div ref={parent}>
        {step == STEPS.init &&
          <RoleSelection onSelect={handleSelectRole} />
        }
        {step == STEPS.login &&
          <LoginForm role={role} onSelectRole={handleSelectRole} onSuccess={handleLogin} />
        }
        {step == STEPS.choice &&
          <AccessibilityChoice onChoice={(type) => (setAccessibilityType(type))} />
        }
      </div>
      <Footer />
    </div>
  );
}
