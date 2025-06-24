import {
  FaEyeSlash,
  FaEarDeaf,
  FaWheelchairMove,
  FaBrain,
  FaChevronRight,
} from "react-icons/fa6";

export default function AccessibilityChoice({ onChoice }) {
  return (
    <main className="flex-1 flex flex-col justify-center items-center px-5">
      <section className="w-full max-w-xs bg-white rounded-2xl shadow-md py-8 px-6 mt-6">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-lg font-semibold text-[#233366] text-center mb-1">
            Qual sua necessidade de acessibilidade?
          </h2>
          <span className="text-xs text-[#6D7B97] text-center">
            Selecione para adaptar sua experiência
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Visual */}
          <button onClick={() => onChoice('visual')} className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent bg-[#E4EDFB] hover:border-[#3653B4] focus:border-[#3653B4] transition shadow-sm w-full mb-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#D6E8FE]">
              <FaEyeSlash className="text-xl text-[#3653B4]" />
            </div>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-base font-semibold text-[#233366]">
                Deficiência Visual
              </span>
              <span className="text-xs text-[#6D7B97]">
                Navegue por gestos e áudio
              </span>
            </div>
            <FaChevronRight className="text-[#A4B1C8]" />
          </button>

          {/* Auditiva */}
          <button onClick={() => onChoice('auditiva')} className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent bg-[#E6F9F1] hover:border-[#30C185] focus:border-[#30C185] transition shadow-sm w-full mb-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#C1F2E2]">
              <FaEarDeaf className="text-xl text-[#30C185]" />
            </div>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-base font-semibold text-[#1D6150]">
                Deficiência Auditiva
              </span>
              <span className="text-xs text-[#6D7B97]">Conteúdos com Libras</span>
            </div>
            <FaChevronRight className="text-[#A4B1C8]" />
          </button>

          {/* Motora */}
          <button onClick={() => onChoice('motora')} className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent bg-[#FFF2CC] hover:border-[#F6B800] focus:border-[#F6B800] transition shadow-sm w-full mb-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFED99]">
              <FaWheelchairMove className="text-xl text-[#F6B800]" />
            </div>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-base font-semibold text-[#987200]">
                Deficiência Motora
              </span>
              <span className="text-xs text-[#6D7B97]">
                Ações por voz e acessibilidade motora
              </span>
            </div>
            <FaChevronRight className="text-[#A4B1C8]" />
          </button>

          {/* Intelectual */}
          <button onClick={() => onChoice('intelectual')} className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent bg-[#FFE6ED] hover:border-[#E5527C] focus:border-[#E5527C] transition shadow-sm w-full">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FFD1E2]">
              <FaBrain className="text-xl text-[#E5527C]" />
            </div>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-base font-semibold text-[#8F2A47]">
                Deficiência Intelectual
              </span>
              <span className="text-xs text-[#6D7B97]">
                Conteúdo amigável e pausado
              </span>
            </div>
            <FaChevronRight className="text-[#A4B1C8]" />
          </button>
        </div>
      </section>
    </main>
  );
}
