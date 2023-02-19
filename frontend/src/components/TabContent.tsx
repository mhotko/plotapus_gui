import HotTable from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { useEffect, useState, memo, useRef, useContext } from "react";
import "./css/TabContent.scss";
import {
  convertedData as convertedDataAtom,
  RefContext
} from "./atoms";
import { useRecoilState } from "recoil";
import Handsontable from "handsontable";

registerAllModules();

interface TabContentProps {
  data: Object;
  filename: string;
}

function tabContent({ data, filename }: TabContentProps) {
  const [rearangedData, setRearangedData] = useState([]);
  const [columnsHeader, setColumnsHeader] = useState([]);
  // const [height, setHeight] = useState(0);
  const [colWidth, setColWidth] = useState(0);
  const [convertedData, setConvertedData] = useRecoilState(convertedDataAtom);
  const { setRef } = useContext(RefContext)
  const hotRef = useRef(undefined)

  useEffect(() => {
    //todo ko zapres tab, izbrises data

    const hot: Handsontable = hotRef.current.hotInstance;
    setRef(hot)
    let columns: string[] = Object.keys(data);
    setColumnsHeader(columns);
    const result: IDataRep | undefined = convertedData.find(
      (x) => x.filename === filename
    );
    if (result === undefined) {
      let arrData = Object.values(data);
      let arrLen = arrData.length;
      let insideLen = arrData[0].length;
      let whole: number[] = [];
      for (let i = 0; i < insideLen; i++) {
        let datum: number[] = [];
        for (let j = 0; j < arrLen; j++) {
          datum.push(arrData[j][i]);
        }
        whole.push(datum);
      }
      let pp: IDataRep = {
        filename: filename,
        cachedData: whole,
        colWidth: Math.max(...columns.map((item) => item.length)) * 9.3
      };
      setRearangedData(whole)
      setConvertedData([...convertedData, pp])
      setColWidth(pp.colWidth)
    } else {
      setRearangedData(result.cachedData)
      setColWidth(result.colWidth)
      hot.deselectCell()
    }
  }, [data]);

  return (
    <div className="tabcontent-container">
      <HotTable
      ref={hotRef}
        data={rearangedData}
        colHeaders={columnsHeader}
        renderAllRows={false}
        outsideClickDeselects={false}
        height="100%"
        autoColumnSize={false}
        rowHeights={24}
        colWidths={colWidth}
        stretchH="all"
        viewportRowRenderingOffset={50}
        contextMenu={{
          items: {
            col_right: {},
            col_left: {},
            remove_col: {},
            set_x_col: {
              name: "Set X column",
              disabled() {
                return this.getSelectedLast()[0] !== -1;
              },
              callback: (key, selection, clickEvent) => {
                const result: IDataRep | undefined = convertedData.find(
                  (x) => x.filename === filename
                );
                var filtered = convertedData.filter((el) => {
                  return el.filename != filename;
                });
                if (result) {
                  const newItem: IDataRep = {
                    filename: result.filename,
                    cachedData: result.cachedData,
                    colWidth: result.colWidth,
                    xCol: selection[0].start.col
                  };
                  setConvertedData([...filtered, newItem]);
                }
              },
            },
          },
        }}
        rowHeaders={true}
        licenseKey="non-commercial-and-evaluation" // for non-commercial use only
      />
    </div>
  );
}

export const TabContent = memo(tabContent);
export default TabContent;
