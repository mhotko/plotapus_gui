import "./css/TabContent.scss";

interface TabChildProps {
  tabData: Tab;
  activeTab: string;
  index: number;
  activateTab: Function;
  closeTab: Function;
}

export default function TabChild({tabData,activeTab, index,activateTab,closeTab} : TabChildProps) {

  function setIconClass(fileType: string): string | undefined {
    switch (fileType) {
      case "csv":
        return "fas fa-file-csv";
      case "import":
        return "fas fa-file-upload";
      case "txt":
        return "fal fa-file-alt";
      case "xlsx":
        return "fas fa-file-excel";
      case "xls":
        return "fas fa-file-excel";
      case "mpr":
        return "far fa-file-chart-line";
      default:
        return "fal fa-question";
    }
  }

  function setIconColor(fileType: string) {
    switch (fileType) {
      case "csv":
        return "csv-icon";
      case "import":
        return "import-icon";
      case "txt":
        return "txt-icon";
      case "xlsx":
        return "excel-icon";
      case "xls":
        return "excel-icon";
      case "mpr":
        return "mpr-icon";
      default:
        return "default-icon";
    }
  }

  return (
    <div
      key={tabData.fileName}
      className={tabData.fileName === activeTab ? "active-tab" : "tab"}
      onClick={() => activateTab(tabData.fileName, index)}
      onKeyDown={() => activateTab(tabData.fileName, index)}
      role="presentation"
    >
      <span className={`file-icon ${setIconColor(tabData.fileType)}`}>
        <i className={setIconClass(tabData.fileType)} />
      </span>
      <span>{tabData.fileName}</span>
      <span
        className="close-tab"
        onClick={(e) => closeTab(tabData.fileName, e)}
        onKeyDown={(e) => closeTab(tabData.fileName, e)}
        role="presentation"
      >
        <i className="fal fa-times" />
      </span>
    </div>
  );
}
