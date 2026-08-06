import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Backtest from "./Backtest";
import Learn from "./Learn";
import Brainteasers from "./Brainteasers";
import { AuthProvider } from "./AuthContext";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/brainteasers" element={<Brainteasers />} />
        </Routes>
        <Analytics/>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;