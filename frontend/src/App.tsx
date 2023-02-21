import { useState } from "react";
import Split from "react-split";
import SheetView from "./components/SheetView";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlotView from "./components/PlotView";
import { RefContext } from "./components/atoms";

function App() {
  const [ref, setRef] = useState({});

  return (
    <>
      <ToastContainer />
      <RefContext.Provider value={{ ref, setRef }}>
        <Split className="split" gutterSize={3}>
          <SheetView />
          <PlotView />
        </Split>
      </RefContext.Provider>
    </>
  );
}

export default App;
