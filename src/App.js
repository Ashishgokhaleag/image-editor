import "./App.css";
import Data from "./data";
import FabricCanvas from "./customImage";
import TestEditor from "./testData";
import { Route, Routes } from "react-router-dom";
import VideoEditorScreen from "./screens/VideoEditorScreen";
import VideoScreen from "./screens/videoScreen";
import Druid from "./druid";
function App() {
  return (
    <div className="App">
      {/* <FabricCanvas/> */}
      {/* <Data /> */}
      {/* <TestEditor/> */}

      <Routes>
        <Route path="/" element={<Data />} />
        <Route path="/video" element={<VideoEditorScreen />} />
        <Route path="/druid" element={<Druid />} />
        <Route path="/VideoScreen" element={<VideoScreen />} />
      </Routes>
    </div>
  );
}

export default App;
