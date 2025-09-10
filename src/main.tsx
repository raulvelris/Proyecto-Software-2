import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
// import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename='/Proyecto-Software-2'>
      <Routes>
        {/*     <Route path="/" element={<LoginPage />} /> */}
        {/*     <Route path="/register" element={<RegisterPage />} /> */}
        {/*     <Route path="/" element={<HomePage />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)