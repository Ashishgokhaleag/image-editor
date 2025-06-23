import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">TensorFlow Extractor</Link> |{" "}
      <Link to="/opencv">OpenCV Extractor</Link>
    </nav>
  );
}
export default Navigation;
