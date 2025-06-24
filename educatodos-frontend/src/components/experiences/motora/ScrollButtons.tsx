import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ScrollButtons = () => {
  const scrollAmount = 300; // pixels por clique

  const scrollUp = () => {
    window.scrollBy({ top: -scrollAmount, behavior: "smooth" });
  };

  const scrollDown = () => {
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="fixed right-4 bottom-28 flex flex-col gap-4 z-50">
      <button
        onClick={scrollUp}
        className="bg-[#E4EDFB] hover:bg-[#cfdcf8] w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
        aria-label="Subir"
      >
        <FaArrowUp className="text-xl text-[#3653B4]" />
      </button>
      <button
        onClick={scrollDown}
        className="bg-[#E4EDFB] hover:bg-[#cfdcf8] w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
        aria-label="Descer"
      >
        <FaArrowDown className="text-xl text-[#3653B4]" />
      </button>
    </div>
  );
};

export default ScrollButtons;