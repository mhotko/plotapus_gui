import Handsontable from "handsontable";
import { useContext } from "react";
import { useRecoilValue } from "recoil";
import { RefContext } from "./atoms";

export default function PlotView() {
  const context: Handsontable = useContext(RefContext);
  const hot: Handsontable = context.ref

  function test() {
    console.log(hot.getSelectedRange())
  }

  return (
    <div className="sheetview-container">
      <button onClick={test} />
    </div>
  );
}
