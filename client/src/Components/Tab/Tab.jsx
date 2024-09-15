import TabMenu from "./TabMenu/TabMenu";
import TabPanel from "./TabPanel/TabPanel";
import "./Tab.style.scss";

function Tab() {
  return (
    <>
      <h1 className="offscreen">전문가톡</h1>
      <div className="tab_chat">
        <TabMenu />
        <TabPanel />
      </div>
    </>
  );
}

export default Tab;
