import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useState, useEffect, useContext } from "react";
import "./css/TabView.scss";
import Import from "./Import";
import TabChild from "./TabChild";
import TabContent from "./TabContent";
import { dataState as dataStateAtom, viewData as viewDataAtom, RefContext } from "./atoms";
import { useRecoilState } from "recoil";

const importTabObj: Tab = {
  fileName: "Import",
  fileType: "import",
};

function TabView() {
  
  // dovolim sam en nov tab saj bos lahka tam importal vec datotek naenkrat
  const [activeTab, setActiveTab] = useState('Import');
  // const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const [allTabs] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isImportTabOpen, setImportTabOpen] = useState(
    allTabs.has('Import')
  );
  const [data, setData] = useRecoilState(dataStateAtom);
  const [viewData, setViewData] = useRecoilState(viewDataAtom);
  const [randomKey, setRandomKey] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [data]);

  function activateTab(fileName: string, overide = false): void {
    // nekje poklice 2x activate tab in 2x fetcha data za prvi tab ki se odpre, poglej kje
    if ((activeTab !== fileName || overide) && fileName !== undefined) {
      setActiveTab(fileName);
      console.log(fileName)
      // setActiveTabIndex(index);
      if (fileName !== "Import") {
        fetchData(fileName);
      }
    }
  }

  const callActivateTab = async (responses: IPostResponse[]) => {
    responses.forEach((value: IPostResponse) => {
      if (allTabs.has(value.filename)) {
        activateTab(value.filename)
        return
      } else {
        let i: Tab = {
          fileName: value.filename,
          fileType: value.filetype,
        };
        allTabs.set(value.filename, i);
      }
    });
    // activateTab(allTabs[allTabs.length - 1].fileName, allTabs.length - 1);
    const [lastKey] = [...allTabs].at(-1) || []
    activateTab(lastKey);
    fetchData(lastKey);
  };

  async function fetchData(filename: string) {
    setIsLoading(true);
    const result = data.find((x) => Object.keys(x)[0] === filename) as Object[];
    if (result === undefined) {
      let response: Response = await fetch("http://127.0.0.1:6969/get_data", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(filename),
        cache: "default",
      });
      
      let t: Object = await response.json();
      let columns: string[] = Object.keys(t);
      let dataO: Object = {};
      for (let i in columns) {
        let column_data: number[] = Object.values(t[columns[i]]);
        let trimmedCol = columns[i].trim();
        dataO[trimmedCol] = column_data;
      }
      let finalObject: Object = {};
      finalObject[filename] = dataO;
      setData([...data, finalObject]);
      setViewData(Object.values(finalObject)[0] as Object);
      setIsLoading(false);
      if (isImportTabOpen) {
        closeTab("Import", null);
      }
    } else {
      setIsLoading(false);
      setViewData(Object.values(result)[0] as Object);
      if (isImportTabOpen) {
        closeTab("Import", null);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onWheel(e: any, viewport: HTMLElement) {
    if (e.deltaY === 0) return;
    if (viewport) {
      const pos = viewport.scrollLeft + e.deltaY;
      e.preventDefault();
      viewport.scrollTo({
        left: pos,
        behavior: "auto",
      });
      let isScrolling;
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        setScrollPos(pos);
      }, 250);
    }
  }

  function importTab() {
    if (isImportTabOpen) return;
    allTabs.set('Import', importTabObj)
    activateTab('Import');
    setImportTabOpen(true);
  }

  function removeFileFetch(filename: string) {
    if (filename !== "Import") {
      fetch("http://127.0.0.1:6969/remove_file", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(filename),
        cache: "default",
      });
    }
  }

  function closeTab(fileName: string, e: Event | null): void {
    if (e !== null) e.stopPropagation();
    const len = allTabs.size;
    const key = Array.from(allTabs.keys())
    //we only have 1 tab open
    if (len === 1) {
      // only the import tab is open, don't delete it
      if (fileName === 'Import') {
        return
      }
      // if we remove the only tab, open the import tab
      importTab();
    } else {
      // we have more than 1 tab open
      if (fileName === 'Import') {
        setImportTabOpen(false)
      }
      if (activeTab === fileName) {
        // we are on the tab we want to delete
        let currentIndex = key.indexOf(fileName)
        let newTab = key[currentIndex - 1]
        activateTab(newTab)
      }
    }
    allTabs.delete(fileName)
    removeFileFetch(fileName);
    //remove from state
    setRandomKey(Math.random())
  }

  return (
    <>
      <OverlayScrollbarsComponent
        id="tabview-scroll"
        options={{
          scrollbars: { autoHide: "leave", autoHideDelay: 150 },
          overflow: { y: "hidden" },
        }}
        events={{
          initialized(instance) {
            const { viewport } = instance.elements();
            if (scrollPos !== 0) {
              viewport.scrollTo({
                left: scrollPos,
                behavior: "auto",
              });
            }
            viewport.addEventListener("wheel", (e) => {
              onWheel(e, viewport);
            });
          },
          destroyed(instance) {
            const { viewport } = instance.elements();
            viewport.removeEventListener("wheel", (e) => {
              onWheel(e, viewport);
            });
          },
        }}
        defer
      >
        <div className="tabview">
          <div className="tabs" key={randomKey}>
            <div
              className="new-tab"
              onClick={() => importTab()}
              onKeyDown={() => importTab()}
              role="presentation"
            >
              <i className="fas fa-file-plus" />
            </div>
            {allTabs.size === 0 ? importTab() : Array.from(allTabs).map(([key, value], index) => {
                  return(<TabChild
                      key={key}
                      tabData={value}
                      activeTab={activeTab}
                      index={index}
                      activateTab={activateTab}
                      closeTab={closeTab}
                    />)
                })
                }
          </div>
        </div>
      </OverlayScrollbarsComponent>
      <div className="tab-content">
        {activeTab === 'Import' ? (<Import callActivateTab={callActivateTab} />) : isLoading ? (
          <h1>Loading...</h1>
        ) : (
          <TabContent data={viewData} filename={activeTab} />
        )
        }
      </div>
    </>
  );
}

export default TabView;
