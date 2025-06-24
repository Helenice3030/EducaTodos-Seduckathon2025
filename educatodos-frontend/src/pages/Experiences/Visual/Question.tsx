import React, { useState } from 'react';
import { speak } from '../../../services/utils';
import { useSpeech } from '../../../hooks/useSpeech';
import VerticalCarousel from '../../../components/experiences/visual/VerticalCarousel';
import { useNavigate } from 'react-router';

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

export default function QuestionCard() {
  const [current, setCurrent] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [ showAnswers, setShowAnswers ] = useState(false);

  const question = questions[current];
  const progressPercent = ((current + 1) / questions.length) * 100;

  function handleSelectAnswer(index) {
    setSelected(index);
    setShowFeedback(true);
  }

  const navigate = useNavigate();

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
      speech.speak("Parabéns! Você terminou as questões! Voltando para a página inicial");
      navigate('/')
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

  const speech = useSpeech();
  const handleClick = () => {
    if(!showAnswers){
      speech.speak('Questão ' + (current+1) + '. ' + question.question)
    }else{

    }
  }
  const handleDoubleClick = () => {
    speech.cancel()
    if(showAnswers){
      handleNext()
      setShowAnswers(false);
    }else{
      setShowAnswers(true);
    }
  }

  const handleSwipe = (index) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    speech.speak('Letra ' + letters[index] + ', ' + question.options[index]);
  }

  return (
    <section onClick={handleClick} onDoubleClick={handleDoubleClick} className="w-full h-full bg-white rounded-2xl shadow-lg px-5 py-6 flex flex-col gap-4 mb-4">

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
      {!showAnswers ? <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#233366] mb-1">{question.question}</h2>
      </div>
      :
      <ul className="flex flex-1 flex-col gap-3">
        <VerticalCarousel onSwipe={handleSwipe} canGoBack={false} items={question.options.map(q => ({
          title: q,
          onSelect: handleSelectAnswer,
          Component: AnswerCard
        }))} />
          {/* {question.options.map((option, i) => {
            const isSelected = selected === i;
            // Define as cores conforme índice (como no seu exemplo)
            const borderColor = i === 0 ? 'border-[#F6B800] text-[#F6B800]' :
                                i === 1 ? 'border-[#3653B4] text-[#3653B4]' :
                                'border-[#30C185] text-[#30C185]';

            return (
              <li key={i}>
                <button
                  onClick={() => handleSelectAnswer(i)}
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
          })} */}
        </ul>
      }


    </section>
  );
}

function AnswerCard ({title, index, onSelect}){
  // Define as cores conforme índice (como no seu exemplo)
  
  const borderColor = index === 0 ? 'border-[#F6B800] text-[#F6B800]' :
                      index === 1 ? 'border-[#3653B4] text-[#3653B4]' :
                      'border-[#30C185] text-[#30C185]';

  return (
    <li className='h-full'>
      <button
        onClick={() => onSelect(index)}
        className={`
          w-full h-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold
          border border-[#E4EDFB] bg-[#F6F8FB] text-[#233366]
          hover:bg-[#E4EDFB] transition focus:ring-2 focus:ring-[#3653B4]
        `}
      >
        <span className={`w-7 h-7 rounded-full border-2 ${borderColor} flex items-center justify-center font-bold`}>
          {String.fromCharCode(65 + index)}
        </span>
        <span>{title}</span>
      </button>
    </li>
  );
}