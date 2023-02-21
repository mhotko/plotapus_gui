import Handsontable from "handsontable";
import { useContext } from "react";
import { RefContext } from "./atoms";
import "./css/PlotView.scss";
import Split from "react-split";
import Plot from "./Plot";
import PlotSettings from "./PlotSettings";

export default function PlotView() {
  const context: {} = useContext(RefContext);
  const hot: Handsontable = context.ref

  function test() {
    console.log(hot.getSelectedRange())
  }

  return (
    <div className="sheetview-container">
      <div className="toolbar">
        
      </div>
      <Split className="split-vert" direction="vertical" gutterSize={3}>
       <Plot></Plot>
       <PlotSettings></PlotSettings>
      </Split>
    </div>
  );
}
