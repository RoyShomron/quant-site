import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Backtest from "./Backtest";
import Learn from "./Learn";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backtest" element={<Backtest />} />
        <Route path="/learn" element={<Learn />} />
      </Routes>
      <Analytics/>
    </BrowserRouter>
  );
}

export default App;