import { useEffect, useState } from "react";
import { FaMicrophone, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router";

const scrollAmount = 300;

const VoiceFooter = ({
  onScrollUp,
  onScrollDown,
  onCommand
}: {
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  onCommand?: () => void;
}) => {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<any>("Aguardando comando de voz...");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const scrollUp = () => {
   if(onScrollUp) {
    onScrollUp();
   } else {
    window.scrollBy({ top: -scrollAmount, behavior: "smooth" });
   }
  };

  const scrollDown = () => {
    if(onScrollDown) {
    onScrollDown();
   } else {
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });
   }
  };

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "pt-BR";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onstart = () => {
      setStatus("Ouvindo... diga o comando.");
    };

    recog.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Comando:", transcript);
      
      setStatus(`Comando recebido: "${transcript}"`);
      handleCommand(transcript);

      // ✅ Para o reconhecimento após pegar o comando
      recog.stop();
    };

    recog.onerror = (event) => {
      console.error("Erro:", event.error);
      setStatus("Erro no reconhecimento.");
    };

    recog.onend = () => {
      setListening(false);
      setTimeout(() => setStatus("Aguardando comando de voz..."), 2000);
    };

    setRecognition(recog);
  }, []);

  const handleCommand = (command: string) => {
    if (command.includes("subir")) {
      scrollUp();
    } else if (command.includes("descer")) {
      scrollDown();
    } else if (command.includes("voltar")) {
      window.history.back();
    } else if (
      command.includes("entrar") ||
      command.includes("confirmar") ||
      command.includes("selecionar")
    ) {
      const active = document.activeElement as HTMLElement;
      if (active) {
        active.click();
        setStatus("Elemento focado acionado.");
      } else {
        setStatus("Nenhum elemento focado.");
      }
    } else {
      onCommand && onCommand(command)
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  return (
    <>
      {/* Footer de Voz */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#E5E8F0] px-5 py-4 flex items-end shadow-lg z-50">
        <button
          onClick={scrollUp}
          className="bg-[#E4EDFB] hover:bg-[#cfdcf8] w-20 h-20 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
          aria-label="Subir"
        >
          <FaArrowUp className="text-xl text-[#3653B4]" />
        </button>
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-[#A4B1C8] mb-3 text-center">{status}</span>
          <button
            onClick={toggleListening}
            id="microphone-toggle"
            className={`w-22 h-22 rounded-full ${
              listening ? "bg-[#30C185]" : "bg-[#E4EDFB]"
            } flex items-center justify-center shadow-lg active:scale-90 outline-none focus:ring-2 focus:ring-[#3653B4] transition`}
            aria-label="Ativar comando de voz"
          >
            <FaMicrophone className="text-2xl text-[#3653B4]" />
          </button>
        </div>
        <button
          onClick={scrollDown}
          className="bg-[#E4EDFB] hover:bg-[#cfdcf8] w-20 h-20 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
          aria-label="Descer"
        >
          <FaArrowDown className="text-xl text-[#3653B4]" />
        </button>
      </div>
    </>
  );
};

export default VoiceFooter;