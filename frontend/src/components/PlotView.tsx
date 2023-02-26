import Handsontable from "handsontable";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { RefContext } from "./atoms";
import "./css/PlotView.scss";
import Split from "react-split";
import Plot from "./Plot";
import PlotSettings from "./PlotSettings";

export default function PlotView() {
  const context: {} = useContext(RefContext);
  const hot: Handsontable = context.ref;
  const [openChart, setOpenChart] = useState(false);
  const [openFunction, setOpenFunction] = useState(false);
  const funcs: Map<string, Function> = new Map([['chart', setOpenChart], ['function', setOpenFunction]])
  const chartRef = useRef(null)
  const funcRef = useRef(null)

  useEffect(() => {

    function handleOutsideClick(event: MouseEvent) {
      if (chartRef !== null && chartRef.current && !chartRef.current.contains(event.target)) {
        (funcs.get('chart') as Function)(false)
      }
      if (funcRef !== null && funcRef.current && !funcRef.current.contains(event.target)) {
        (funcs.get('function') as Function)(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }

  },[])

  const handleOpen = (type: string) => {
    for (let [key, value] of funcs.entries()) {
      if (key === type) {
        value(true)
      } else {
        value(false)
      }
    }
  }

  return (
    <div className="sheetview-container">
      <div className="toolbar">
        <div className="chart-dropdown" onClick={() => handleOpen('chart')} ref={chartRef}>
          <i className="far fa-chart-bar fw"></i>
          {(openChart) ? (<div className="sidebar-menu">
            <div className="chart-element">Line chart</div>
            <div className="chart-element">Scatter chart</div>
            <div className="chart-element">Pie chart</div>
          </div>) : null}
          
        </div>
        <div className="chart-dropdown" onClick={() => handleOpen('function')} ref={funcRef}>
        <i className="far fa-function"></i>
          {(openFunction) ? (<div className="sidebar-menu">
            <div className="chart-element">Line chart</div>
            <div className="chart-element">Scatter chart</div>
            <div className="chart-element">Pie chart</div>
          </div>) : null}
          
        </div>
      </div>
      <Split className="split-vert" direction="vertical" gutterSize={3}>
        <Plot></Plot>
        <PlotSettings></PlotSettings>
      </Split>
    </div>
  );
}

interface DropdownProps {
  open: boolean;
  icon: ReactNode;
  trigger: ReactNode;
  menu: ReactNode[];
}

const Dropdown = ({ open, icon, trigger, menu }: DropdownProps) => {
  // return (
    // <>
    //   <div className="dropdown">
    //     {trigger}
    //     {open ? (
    //       <ul className="menu">
    //         {menu.map((menuItem, index) => (
    //           <li key={index} className="menu-item">
    //             {menuItem}
    //           </li>
    //         ))}
    //       </ul>
    //     ) : null}
    //   </div>
    // </>

  // );
};
