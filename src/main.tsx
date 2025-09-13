import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import InvitationSendingPage from "./pages/InvitationSendingPage"

// import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename='/'>
      <Routes>
        {/*     <Route path="/" element={<LoginPage />} /> */}
        {/*     <Route path="/register" element={<RegisterPage />} /> */}
        {/*     <Route path="/" element={<HomePage />} /> */}
        <Route path="/invitation-sending" element={<InvitationSendingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)