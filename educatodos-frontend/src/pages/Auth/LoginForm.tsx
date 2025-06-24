import React, { useEffect, useState } from 'react';
import {
  FaUserTie,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaEnvelope,
  FaLock
} from 'react-icons/fa';

const userTypes = [
  {
    id: 'manager',
    icon: <FaUserTie className="text-[#3653B4] text-base" />,
    label: 'Gestão',
    color: '#3653B4',
    bg: 'bg-[#E4EDFB]',
    textColor: 'text-[#233366]',
  },
  {
    id: 'teacher',
    icon: <FaChalkboardTeacher className="text-[#30C185] text-base" />,
    label: 'Professor',
    color: '#30C185',
    bg: 'bg-[#E6F9F1]',
    textColor: 'text-[#1D6150]',
  },
  {
    id: 'student',
    icon: <FaUserGraduate className="text-[#F6B800] text-base" />,
    label: 'Aluno',
    color: '#F6B800',
    bg: 'bg-[#FFF2CC]',
    textColor: 'text-[#987200]',
  },
  {
    id: 'parent',
    icon: <FaUsers className="text-[#E5527C] text-base" />,
    label: 'Responsável',
    color: '#E5527C',
    bg: 'bg-[#FFE6ED]',
    textColor: 'text-[#8F2A47]',
  },
];

function LoginForm({ role, onSelectRole, onSuccess }) {
  const [activeTab, setActiveTab] = useState(role);

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');

  useEffect(() => {
    onSelectRole(activeTab);
  }, [ activeTab]);

  const handleLogin = () => {
    onSuccess({
      email,
      password
    })
  }

  return (
    <main className="flex-1 flex flex-col justify-center items-center px-5">
      <section className="w-full max-w-xs bg-white rounded-2xl shadow-md py-8 px-6 mt-6">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-lg font-semibold text-[#233366] text-center mb-1">Entrar na plataforma</h2>
          <span className="text-xs text-[#6D7B97] text-center">Informe seus dados de acesso</span>
        </div>

        <div className="flex justify-between items-center gap-2 mb-6">
          {userTypes.map(user => (
            <button
              key={user.id}
              onClick={() => setActiveTab(user.id)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition shadow-sm border-2 ${
                activeTab === user.id
                  ? `${user.bg} border-[${user.color}]`
                  : 'bg-white border-transparent'
              }`}
              style={activeTab === user.id ? { backgroundColor: user.bg.replace('bg-[', '').replace(']', '') } : {}}
            >
              {user.icon}
              <span className={`text-xs font-medium ${user.textColor}`}>{user.label}</span>
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-[#233366] font-medium">{activeTab == 'student' ? 'RA (matrícula)' : "E-mail"}</label>
            <div className="relative">
              <input
                type={activeTab == 'student' ? 'text' : "email"}
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#E8EBF0] focus:border-[#3653B4] transition px-4 py-2 text-sm bg-[#F6F8FB] placeholder-[#A4B1C8] focus:outline-none"
                placeholder={activeTab == 'student' ? 'Seu RA' : "Seu e-mail"}
              />
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4B1C8] text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs text-[#233366] font-medium">Senha</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#E8EBF0] focus:border-[#3653B4] transition px-4 py-2 text-sm bg-[#F6F8FB] placeholder-[#A4B1C8] focus:outline-none"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4B1C8] text-sm" />
            </div>
          </div>

          {/* <div className="flex justify-end mt-1">
            <span className="text-xs text-[#3653B4] underline cursor-pointer">Esqueceu a senha?</span>
          </div> */}

          <button
            type="button"
            onClick={handleLogin}
            className="mt-3 w-full py-3 bg-[#3653B4] hover:bg-[#233366] text-white rounded-xl font-semibold text-base transition shadow focus:outline-none"
          >
            Entrar
          </button>
        </form>

        {/* <div className="flex items-center my-4 gap-2">
          <div className="h-px flex-1 bg-[#E8EBF0]" />
          <span className="text-xs text-[#A4B1C8]">ou</span>
          <div className="h-px flex-1 bg-[#E8EBF0]" />
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-[#6D7B97]">Ainda não tem conta?</span>
          <a className="text-[#3653B4] underline text-xs font-semibold mt-1 cursor-pointer">Criar cadastro</a>
        </div> */}
      </section>
    </main>
  );
}

export default LoginForm;
