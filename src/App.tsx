import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import AddWithoutConversion from "./pages/AddWithoutConversion";
import AddWithConversion from "./pages/AddWithConversion";
import AddAdvanced from "./pages/AddAdvanced";
import AddAdvanced3Digits from "./pages/AddAdvanced3Digits";
import SubtractWithoutConversion from "./pages/SubtractWithoutConversion";
import SubtractWithConversion from "./pages/SubtractWithConversion";
import SubtractAdvanced2Digits from "./pages/SubtractAdvanced2Digits";
import SubtractAdvanced3Digits from "./pages/SubtractAdvanced3Digits";
import MultiplicationTable from "./pages/MultiplicationTable";
import MultiplyAdvanced from "./pages/MultiplyAdvanced";
import OrderOfOperations from "./pages/OrderOfOperations";
import FractionAddition from "./pages/FractionAddition";
import LeastCommonDenominator from "./pages/LeastCommonDenominator";
import FractionTest from "./pages/FractionTest";
import NumberLine from "./pages/NumberLine";
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
            <Route path="/practice/addition/add-with-conversion" element={<AddWithConversion />} />
            <Route path="/practice/addition/add-advanced" element={<AddAdvanced />} />
            <Route path="/practice/addition/add-advanced-3digits" element={<AddAdvanced3Digits />} />
            <Route path="/practice/subtraction/subtract-without-conversion" element={<SubtractWithoutConversion />} />
            <Route path="/practice/subtraction/subtract-with-conversion" element={<SubtractWithConversion />} />
            <Route path="/practice/subtraction/subtract-advanced-2digits" element={<SubtractAdvanced2Digits />} />
            <Route path="/practice/subtraction/subtract-advanced-3digits" element={<SubtractAdvanced3Digits />} />
            <Route path="/practice/multiplication/multiplication-table" element={<MultiplicationTable />} />
            <Route path="/practice/multiplication/multiply-advanced" element={<MultiplyAdvanced />} />
            <Route path="/practice/order-of-operations/order-of-operations" element={<OrderOfOperations />} />
            <Route path="/practice/fractions/fraction-addition" element={<FractionAddition />} />
            <Route path="/practice/fractions/least-common-denominator" element={<LeastCommonDenominator />} />
            <Route path="/practice/fractions/fraction" element={<FractionTest />} />
            <Route path="/practice/number-line/number-line" element={<NumberLine />} />
            <Route path="/practice/:subject/:testName" element={<div style={{ padding: 20 }}>Practice page coming soon...</div>} />
          </Routes>
        </Layout>
      </UserProvider>
    </SettingsProvider>
  );
}
