import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useState, useEffect, useContext } from "react";
import "./css/TabView.scss";
import Import from "./Import";
import TabChild from "./TabChild";
import TabContent from "./TabContent";
import { dataState as dataStateAtom, viewData as viewDataAtom, RefContext } from "./atoms";
import { useRecoilState } from "recoil";

interface TabViewProps {
  tabs?: Tab[];
}

const importTabObj: Tab = {
  fileName: "Import",
  fileType: "import",
};

function TabView({ tabs = [] }: TabViewProps) {
  
  // dovolim sam en nov tab saj bos lahka tam importal vec datotek naenkrat
  const [activeTab, setActiveTab] = useState(
    tabs.length === 0 ? "Import" : tabs[0].fileName
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const [allTabs] = useState(tabs);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportTabOpen, setImportTabOpen] = useState(
    allTabs.indexOf(importTabObj) >= 0
  );
  const [data, setData] = useRecoilState(dataStateAtom);
  const [viewData, setViewData] = useRecoilState(viewDataAtom);
  const [randomKey, setRandomKey] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [data]);

  function activateTab(fileName: string, index: number, overide = false): void {
    if (activeTab !== fileName || overide) {
      setActiveTab(fileName);
      setActiveTabIndex(index);
      if (fileName !== "Import") {
        fetchData(fileName);
      }
    }
  }

  const callActivateTab = async (responses: IPostResponse[]) => {
    responses.forEach((value: IPostResponse) => {
      if (allTabs.some((e) => e.fileName === value.filename)) {
        const i = allTabs.findIndex((e) => e.fileName === value.filename);
        activateTab(value.filename, i);
      } else {
        let i: Tab = {
          fileName: value.filename,
          fileType: value.filetype,
        };
        allTabs.push(i);
      }
    });
    activateTab(allTabs[allTabs.length - 1].fileName, allTabs.length - 1);
    fetchData(allTabs[allTabs.length - 1].fileName);
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
      closeTab("Import", null);
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
    } else {
      setIsLoading(false);
      setViewData(Object.values(result)[0] as Object);
      closeTab("Import", null);
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
    allTabs.push(importTabObj);
    activateTab(allTabs[allTabs.length - 1].fileName, allTabs.length - 1);
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
    const len = allTabs.length;
    for (let i = 0; i < allTabs.length; i += 1) {
      if (allTabs[i].fileName === fileName) {
        if (
          activeTabIndex === 0 &&
          allTabs.length === 1 &&
          allTabs[i].fileType === "import"
        )
          return;
        if (allTabs[i].fileType === "import") setImportTabOpen(false);
        // predn zapremo se prestavmo na prejsn tab ce smo trenutno na aktivnem ce ne ignoriramo, ce ga ni gremo na new tab
        let dataIndex = data.findIndex((x) => Object.keys(x)[0] === fileName);
        if (activeTabIndex === 0 && allTabs.length === 1) {
          allTabs.splice(i, 1);
          // setData(data.splice(dataIndex, 1))
          removeFileFetch(fileName);
          importTab();
          return;
        }
        if (allTabs.indexOf(allTabs[i]) === activeTabIndex) {
          if (activeTabIndex + 1 === len) {
            allTabs.splice(i, 1);
            activateTab(
              allTabs[activeTabIndex - 1].fileName,
              activeTabIndex - 1
            );
            removeFileFetch(fileName);
            // setData(data.splice(dataIndex, 1))
            return;
          }
          allTabs.splice(i, 1);
          activateTab(allTabs[activeTabIndex].fileName, activeTabIndex);
          removeFileFetch(fileName);
          // setData(data.splice(dataIndex, 1))
          return;
        }
        allTabs.splice(i, 1);
        if (i > activeTabIndex) {
          activateTab(allTabs[activeTabIndex].fileName, activeTabIndex, true);
          removeFileFetch(fileName);
          // setData(data.splice(dataIndex, 1))
        } else {
          activateTab(
            allTabs[activeTabIndex - 1].fileName,
            activeTabIndex - 1,
            true
          );
          removeFileFetch(fileName);
          // setData(data.splice(dataIndex, 1))
        }
      }
    }
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
            {allTabs.length === 0
              ? importTab()
              : allTabs.map((tabData: Tab, index) => {
                  return (
                    <TabChild
                      key={tabData.fileName}
                      tabData={tabData}
                      activeTab={activeTab}
                      index={index}
                      activateTab={activateTab}
                      closeTab={closeTab}
                    />
                  );
                })}
          </div>
        </div>
      </OverlayScrollbarsComponent>
      <div className="tab-content">
        {allTabs[activeTabIndex].fileType === "import" ? (
          <Import callActivateTab={callActivateTab} />
        ) : isLoading ? (
          <h1>Loading...</h1>
        ) : (
          <TabContent data={viewData} filename={activeTab} />
        )}
      </div>
    </>
  );
}

export default TabView;
