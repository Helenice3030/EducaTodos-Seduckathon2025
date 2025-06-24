import { useContext, useEffect, useState } from "react";
import { FaChevronRight, FaHandSparkles } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useSwipeable } from "react-swipeable";
import { HandledEvents } from "react-swipeable/es/types";
import { AuthContext } from "../../../context/AuthProvider";

export default function VerticalCarousel({ canGoBack, items, onSwipe }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === "UP") {
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (direction === "DOWN") {
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const { themeOptions } = useContext(AuthContext);

  useEffect(() => {
    if(onSwipe) onSwipe(activeIndex)
  }, [activeIndex]);


  const handlers = useSwipeable({
    onSwipedUp: () => handleSwipe("UP"),
    onSwipedDown: () => handleSwipe("DOWN"),
    onSwipedRight: () => canGoBack && navigate(-1),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
    onTouchStartOrOnMouseDown: (event) => {
      if(event.event.target?.dataset?.index) onSwipe(event.event.target.dataset.index)
    },
    
  });

  const getTextClass = () => {
    let classes = "";
    if (themeOptions?.fontSize === 1.2) classes += " text-lg";
    if (themeOptions?.fontSize === 1.4) classes += " text-xl";
    if (themeOptions?.simpleMode) classes += " uppercase";
    return classes;
  };

  const navigate = useNavigate();

  return (
    <div className="w-full h-full overflow-hidden relative rounded-2xl border-3 border-blue-950 dark:border-white">
      <div
        {...handlers}
        className="relative transition-transform duration-500 h-full"
        style={{
          transform: `translateY(-${activeIndex * 100}%)`,
        }}
      >
        {items.map((data, index) => {
          if(data.Component) return <data.Component index={index} data-index={index} {...data} />
          return <div data-index={index} onDoubleClick={() => data.onClick && data.onClick(data.id)} key={data.id} className={`absolute left-0 bg-white dark:bg-black rounded-2xl p-4 h-full w-full shadow-sm flex flex-col justify-center items-center gap-3`} style={{top: `${index*100}%`}}>
            <div className="pointer-events-none select-none flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0" style={{ backgroundColor: `${data.cor}1A`, color: data.cor }}>
              {data.icone}
            </div>
            <div className="pointer-events-none  select-none flex flex-col">
              <span className={`text-center font-semibold text-[#253858] text-2xl dark:text-white ${getTextClass()}`}>{data.nome}</span>
              <span className={`text-center text-lg text-[#7B8794] dark:text-white ${getTextClass()}`}>{data.descricao}</span>
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}