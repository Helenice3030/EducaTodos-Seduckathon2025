import React, { useContext, useState } from 'react';
import { FaEyeSlash, FaSchool } from 'react-icons/fa';
import Logo from '../../images/logov.png';
import { FaChevronLeft, FaCircleChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthProvider';
import { FaBars, FaCommentDots, FaEarDeaf } from 'react-icons/fa6';
import Button from '../ui/button/Button';
import ModalSugestoes from './ModalSugestoes';

function Header({ custom = false, hide, back = true, icon, color, title, desc, accessibility = 'Auditiva', accessibilityIcon = <FaEarDeaf/>, accessibilityDescription = 'Leitura e Libras'}) {

  const navigate = useNavigate()

  const { logout, user } = useContext(AuthContext);

  const [modalSugestoes, setModalSugestoes] = useState(false);

  return (
    <>
      <header className="sticky top-0 w-full px-5 py-2 bg-white dark:bg-[#000] shadow-sm flex justify-between z-999">
        {back ? <button 
          type="button"
          onClick={() => navigate(-1)}
          className='w-10 h-10 bg-brand-100 rounded-2xl grid place-content-center'>
          <FaChevronLeft className='text-brand-500'/>
        </button> : <div className="w-10 h-10"></div>}
        <img src={Logo} className="h-[40px]" />
        <button type="button" onClick={() => logout()} className="w-10 h-10 bg-red-100 text-red-500 rounded-2xl grid place-content-center text-sm font-medium">Sair</button>

      </header>
      {!hide && <div className="flex justify-center mt-3">
        {!custom ?
          <section className="relative w-full max-w-xs bg-white rounded-2xl shadow-lg px-6 py-7 flex flex-col items-center mb-3">
            <button onClick={() => setModalSugestoes(true)} className="w-20 h-20 absolute right-[-10px] top-[-10px] text-xs p-1 flex flex-col justify-center items-center rounded-full bg-amber-100 border border-amber-400">
              <FaBars className='text-xl text-amber-500' />
              {/* Sugestões e Denúncias */}
            </button>
            <div className="flex flex-col items-center mb-3">
              <img
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                alt="Avatar do Aluno"
                className="w-16 h-16 rounded-full border-4 border-[#E4EDFB] object-cover mb-2"
              />
              <h2 className="text-lg font-bold text-[#233366]">Olá, {user?.name}!</h2>
              <span className="text-xs text-[#6D7B97] mt-1">{user?.student_info?.turma?.name}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-[#E4EDFB] rounded-lg px-3 py-1">
              <div className='text-sm text-brand-800'>
              {accessibilityIcon}
              </div>
              <span className="text-xs text-[#3653B4] font-semibold">Deficiência {accessibility}</span>
              <span className="text-xs text-[#A4B1C8] ml-1">({accessibilityDescription})</span>
            </div>

          </section>
          :
          <section className="w-full max-w-xs bg-white rounded-2xl shadow-lg px-6 py-3 flex flex-col items-center mb-3">
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${color}1A`, color: color }}>
                {icon}
              </div>
              <h2 className="text-lg font-bold text-[#233366]">{title}</h2>
              <span className="text-xs text-[#6D7B97] mt-1">{desc}</span>
            </div>
          </section>

        }
      </div>}
      <ModalSugestoes isOpen={modalSugestoes} onClose={() => setModalSugestoes(false)} />
    </>
  );
}

export default Header;