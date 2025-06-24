import { useCallback, useEffect } from "react";

function VLibrasPlugin({ enabled = true }) {
  useEffect(() => {
    // renderVLibras()
    if(!enabled){
      const container = document.getElementById("vlibras-container");
      if(container) container.remove();

    }
  }, []);

  // const renderVLibras = useCallback(() => {

  //   // Elemento container do VLibras
  //   const container = document.getElementById("vlibras");
  //   container.innerHTML = `
  //     <div vw class="enabled">
  //       <div vw-access-button class="active"></div>
  //       <div vw-plugin-wrapper>
  //         <div class="vw-plugin-top-wrapper"></div>
  //       </div>
  //     </div>
      
  //   `;
  //   new window.VLibras.Widget('https://vlibras.gov.br/app');
  // }, []);

  return null; // Não renderiza nada no JSX
}

export default VLibrasPlugin;