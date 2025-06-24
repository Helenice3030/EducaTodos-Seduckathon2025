import React from 'react';
import { FaSchool } from 'react-icons/fa';
import Logo from '../../images/logov.png';

function Header() {
  return (
    <header className="w-full px-5 pt-8 pb-4 bg-white shadow-sm flex flex-col items-center">
      <img src={Logo} width={300} />
      <span className="text-xs text-[#6D7B97] mt-1">Estudos acessíveis para todos</span>
    </header>
  );
}

export default Header;