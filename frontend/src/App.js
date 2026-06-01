import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Backtest from "./Backtest";
import Learn from "./Learn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backtest" element={<Backtest />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;