import React, { useState } from 'react';

const questions = [
  {
    question: "O que é comunicação oral?",
    options: [
      "Falar, conversar ou apresentar ideias com a voz.",
      "Escrever textos em um caderno.",
      "Desenhar figuras para se comunicar."
    ],
    answer: 0
  },
  {
    question: "Qual é o principal objetivo da comunicação escrita?",
    options: [
      "Ouvir músicas.",
      "Registrar ideias para serem lidas depois.",
      "Falar em público."
    ],
    answer: 1
  },
  {
    question: "Onde usamos mais a comunicação oral?",
    options: [
      "Em conversas e apresentações.",
      "Ao escrever cartas.",
      "Ao desenhar no quadro."
    ],
    answer: 0
  }
];

export default function QuestionCard({ itemRefs }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = questions[current];
  const progressPercent = ((current + 1) / questions.length) * 100;

  function handleSelectAnswer(index) {
    setSelected(index);
    setShowFeedback(true);
  }

  function handleNext() {
    if (selected === null) {
      alert("Selecione uma alternativa.");
      return;
    }
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      alert("Parabéns! Você terminou as questões.");
      // Aqui pode redirecionar ou resetar o quiz
    }
  }

  function handleBack() {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  return (
    <section className="w-full max-w-xs bg-white rounded-2xl shadow-lg px-5 py-6 flex flex-col gap-4 mb-4">

      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#3653B4] font-semibold">
          Questão <span className="font-bold">{current + 1}</span>/{questions.length}
        </span>
        <div className="flex-1 h-2 ml-3 rounded-full bg-[#E4EDFB]">
          <div
            className="h-2 bg-[#F6B800] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Pergunta e opções */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#233366] mb-1">{question.question}</h2>
        <ul className="flex flex-col gap-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            // Define as cores conforme índice (como no seu exemplo)
            const borderColor = i === 0 ? 'border-[#F6B800] text-[#F6B800]' :
                                i === 1 ? 'border-[#3653B4] text-[#3653B4]' :
                                'border-[#30C185] text-[#30C185]';

            return (
              <li key={i}>
                <button
                  onClick={() => handleSelectAnswer(i)}
                  tabIndex={0}
                  ref={el => itemRefs.current[i] = el}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold
                    border border-[#E4EDFB] bg-[#F6F8FB] text-[#233366]
                    hover:bg-[#E4EDFB] transition focus:ring-2 focus:ring-[#3653B4]
                    ${isSelected ? 'ring-2 ring-offset-2 bg-[#E4EDFB] border-[#F6B800]' : ''}
                  `}
                >
                  <span className={`w-7 h-7 rounded-full border-2 ${borderColor} flex items-center justify-center font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Controles */}
      <div className="w-full flex items-center justify-between gap-2 mt-4">
        <button
          onClick={handleBack}
          tabIndex={0}
          ref={el => itemRefs.current[question.options.length] = el}
          disabled={current === 0}
          className={`flex items-center gap-2 bg-transparent px-4 py-2 rounded-lg text-[#3653B4] font-semibold text-sm hover:underline focus:ring-2 focus:ring-blue-500
            ${current === 0 ? 'opacity-50' : ''}
          `}
        >
          <i className="fa-solid fa-arrow-left text-base"></i>
          Anterior
        </button>

        <button
          onClick={handleNext}
          tabIndex={0}
          ref={el => itemRefs.current[question.options.length+1] = el}
          className="flex items-center gap-2 bg-[#F6B800] focus:ring-2 focus:ring-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow hover:bg-[#e5ac00] transition"
        >
          {current === questions.length - 1 ? (
            <>
              Finalizar
              <i className="fa-solid fa-check text-base"></i>
            </>
          ) : (
            <>
              Próxima
              <i className="fa-solid fa-arrow-right text-base"></i>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
