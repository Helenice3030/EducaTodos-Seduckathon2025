import { useContext } from "react";
import { FaHeading, FaTextHeight } from "react-icons/fa6";
import { useTheme } from "../../../context/ThemeContext";
import { AuthContext } from "../../../context/AuthProvider";
import { FaAdjust, FaUndo } from "react-icons/fa";

type Props = {
  className?: string;
};

export default function VisualAdjustments({ className = "" }: Props) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { themeOptions, setThemeOptions } = useContext(AuthContext);

  const reset = () => {
    setThemeOptions({
      fontSize: 1,
      simpleMode: false,
    });
    setTheme("light");
  };

  return (
    <div className="mt-2">

      <div className="grid grid-cols-4 gap-2">
        {/* Aumentar Texto */}
        <button
          onClick={() =>
            setThemeOptions((prev) => ({
              ...prev,
              fontSize: prev?.fontSize < 1.4 ? prev?.fontSize + 0.2 : 1.4,
            }))
          }
          className="bg-blue-100 rounded-xl p-3 flex flex-col items-center hover:bg-blue-200"
        >
          <FaTextHeight />
          <span className="text-xs text-center">Aumentar Texto</span>
        </button>

        {/* Texto Maiúsculo */}
        <button
          onClick={() =>
            setThemeOptions((prev) => ({
              ...prev,
              simpleMode: !prev?.simpleMode,
            }))
          }
          className="bg-yellow-100 rounded-xl p-3 flex flex-col items-center hover:bg-yellow-200"
        >
          <FaHeading />
          <span className="text-xs text-center">
            {!themeOptions?.simpleMode ? "Maiúsculas" : "Texto Normal"}
          </span>
        </button>

        {/* Contraste */}
        <button
          onClick={toggleTheme}
          className="bg-[#000] text-white rounded-xl p-3 flex flex-col items-center hover:bg-gray-800"
        >
          <FaAdjust />
          <span className="text-xs text-center">Contraste</span>
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className="bg-red-100 rounded-xl p-3 flex flex-col items-center hover:bg-red-200"
        >
          <FaUndo />
          <span className="text-xs text-center">Resetar Ajustes</span>
        </button>
      </div>
    </div>
  );
}
