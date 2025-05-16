import "./App.css";
import Data from "./data";
import FabricCanvas from "./customImage";
import TestEditor from "./testData";
import { Route, Routes } from "react-router-dom";
import VideoEditorScreen from "./screens/VideoEditorScreen";
import VideoScreen from "./screens/videoScreen";
import Druid from "./druid";
import SupersetIframe from "./SupersetIframe";
import ChartExplorer from "./PivotTableDemo/ChartViewer";
import Navbar from "./Navbar";
import PivotTable from "./components/PivotDruid/PivotTable";

function App() {
  return (
    <div className="App">
      {/* <FabricCanvas/> */}
      {/* <Data /> */}
      {/* <TestEditor/> */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Data />} />
        <Route path="/video" element={<VideoEditorScreen />} />
        <Route path="/druid" element={<Druid />} />
        <Route path="/VideoScreen" element={<VideoScreen />} />
        <Route path="/iframe" element={<SupersetIframe />} />
        <Route path="/pivot" element={<ChartExplorer />} />
        <Route path="/druidPivot" element={<PivotTable/>} />
      </Routes>
    </div>
  );
}

export default App;
