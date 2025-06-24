export const speak = (text) => {
  window.speechSynthesis.cancel(); // Cancela leitura anterior, se houver
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  window.speechSynthesis.speak(utterance);
};