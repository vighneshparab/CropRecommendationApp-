import { BrowserRouter } from "react-router-dom";
import Routes from "./routes/routes.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </>
  );
}

export default App;
