import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import AddWithoutConversion from "./pages/AddWithoutConversion";
import MultiplicationTable from "./pages/MultiplicationTable";
import OrderOfOperations from "./pages/OrderOfOperations";
import FractionAddition from "./pages/FractionAddition";
import LeastCommonDenominator from "./pages/LeastCommonDenominator";
import FractionTest from "./pages/FractionTest";
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
            <Route path="/practice/addition/add-without-conversion" element={<AddWithoutConversion />} />
            <Route path="/practice/addition/add-with-conversion" element={<div style={{ padding: 20 }}>Coming soon...</div>} />
            <Route path="/practice/multiplication/multiplication-table" element={<MultiplicationTable />} />
            <Route path="/practice/order-of-operations/order-of-operations" element={<OrderOfOperations />} />
            <Route path="/practice/fractions/fraction-addition" element={<FractionAddition />} />
            <Route path="/practice/fractions/least-common-denominator" element={<LeastCommonDenominator />} />
            <Route path="/practice/fractions/fraction" element={<FractionTest />} />
            <Route path="/practice/:subject/:testName" element={<div style={{ padding: 20 }}>Practice page coming soon...</div>} />
          </Routes>
        </Layout>
      </UserProvider>
    </SettingsProvider>
  );
}
