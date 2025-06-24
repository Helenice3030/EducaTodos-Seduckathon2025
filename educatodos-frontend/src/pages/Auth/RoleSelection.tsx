import React from 'react';
import { FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaUsers } from 'react-icons/fa';

function RoleSelection({ onSelect }) {
  return (
    <main className="flex-1 flex flex-col justify-center items-center px-5">
      <section className="w-full max-w-xs bg-white rounded-2xl shadow-md py-8 px-6 mt-6">
        <h2 className="text-lg font-semibold text-[#233366] mb-6 text-center">Quem está acessando?</h2>
        
        <div className="flex flex-col gap-4">
          <RoleButton
            onClick={() => onSelect('manager')}
            bgColor="bg-[#E4EDFB]"
            hoverBg="hover:bg-[#d5e3fb]"
            iconBg="bg-[#3653B4]"
            icon={<FaUserTie className="text-lg" />}
            role="Gestão"
            roleColor="text-[#233366]"
            description="Administrador escolar"
            descColor="text-[#6D7B97]"
          />

          <RoleButton
            onClick={() => onSelect('teacher')}
            bgColor="bg-[#E6F9F1]"
            hoverBg="hover:bg-[#d4f3e4]"
            iconBg="bg-[#30C185]"
            icon={<FaChalkboardTeacher className="text-lg" />}
            role="Professor"
            roleColor="text-[#1D6150]"
            description="Educador(a) escolar"
            descColor="text-[#509D87]"
          />

          <RoleButton
            onClick={() => onSelect('student')}
            bgColor="bg-[#FFF2CC]"
            hoverBg="hover:bg-[#ffe5a4]"
            iconBg="bg-[#F6B800]"
            icon={<FaUserGraduate className="text-lg" />}
            role="Aluno"
            roleColor="text-[#987200]"
            description="Estudante"
            descColor="text-[#C6A23A]"
          />

          <RoleButton
            onClick={() => onSelect('parent')}
            bgColor="bg-[#FFE6ED]"
            hoverBg="hover:bg-[#ffd0de]"
            iconBg="bg-[#E5527C]"
            icon={<FaUsers className="text-lg" />}
            role="Responsável"
            roleColor="text-[#8F2A47]"
            description="Pais ou responsáveis"
            descColor="text-[#C87097]"
          />
        </div>

        {/* <div className="mt-8 text-center">
          <span className="text-xs text-[#6D7B97]">Já possui uma conta?</span>
          <span className="ml-1 text-[#3653B4] underline text-xs font-semibold cursor-pointer">Fazer login</span>
        </div> */}
      </section>
    </main>
  );
}

export default RoleSelection;

function RoleButton({ onClick, bgColor, hoverBg, iconBg, icon, role, roleColor, description, descColor }) {
  return (
    <button type="button" onClick={() => onClick && onClick()} className={`flex items-center px-4 py-3 ${bgColor} ${hoverBg} rounded-xl transition shadow-sm`}>
      <span className={`w-10 h-10 ${iconBg} text-white flex items-center justify-center rounded-lg mr-4`}>
        {icon}
      </span>
      <span className="flex flex-col text-left">
        <span className={`font-medium ${roleColor} text-base`}>{role}</span>
        <span className={`text-xs ${descColor}`}>{description}</span>
      </span>
    </button>
  );
}
