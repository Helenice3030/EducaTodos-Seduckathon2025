import { useState } from "react";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import Resumo from "./tabs/Resumo";
import Extras from "./tabs/Extras";
import Questoes from "./tabs/Questoes";
import Respostas from "./tabs/Respostas";
import { useParams } from "react-router";

const tabs = ["Resumo", "Materiais Complementares", "Questões", "Respostas"] as const;

export default function EditConteudo() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Resumo");

  return (
    <>
      <PageBreadcrumb pageTitle={"Novo Conteúdo"} pageBadge={'Matemática'} />
      <div className="mb-5">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10">
        {activeTab === "Resumo" && <Resumo />}
        {activeTab === "Materiais Complementares" && <Extras />}
        {activeTab === "Questões" && <Questoes />}
        {activeTab === "Respostas" && <Respostas />}
      </div>
    </>
  );
}
