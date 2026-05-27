import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Backtest from "./Backtest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backtest" element={<Backtest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;