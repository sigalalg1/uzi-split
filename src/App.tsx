import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import InstallPWA from "./components/InstallPWA";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import SubjectPage from "./pages/SubjectPage";
import DynamicTest from "./pages/DynamicTest";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import PracticeHistory from "./pages/PracticeHistory";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <SettingsProvider>
      <UserProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/history" element={<PracticeHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:subject" element={<SubjectPage />} />
            <Route path="/practice/:subject/:testName" element={<DynamicTest />} />
          </Routes>
          <InstallPWA />
        </Layout>
      </UserProvider>
    </SettingsProvider>
  );
}
