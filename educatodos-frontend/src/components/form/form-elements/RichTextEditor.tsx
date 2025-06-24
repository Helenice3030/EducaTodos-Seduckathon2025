import React, { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

interface RichTextEditorQuillProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditorQuill({
  value,
  onChange,
}: RichTextEditorQuillProps) {
  const { quill, quillRef } = useQuill();

  // Atualiza o conteúdo quando o prop "value" mudar (edição externa)
  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || "";
    }
  }, [quill, value]);

  // Lida com a edição do usuário
  useEffect(() => {
    if (quill) {
      const handleChange = () => {
        onChange(quill.root.innerHTML);
      };
      quill.on("text-change", handleChange);
      return () => {
        quill.off("text-change", handleChange);
      };
    }
  }, [quill, onChange]);

  // Configurações do toolbar padrão do Quill (pode customizar)
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <div>
      <div ref={quillRef} style={{ minHeight: "200px", background: "white" }} />
    </div>
  );
}
