import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import AddWithoutConversion from "./pages/AddWithoutConversion";
import OrderOfOperations from "./pages/OrderOfOperations";
import FractionTest from "./pages/FractionTest";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/addition/add-without-conversion" element={<AddWithoutConversion />} />
        <Route path="/practice/addition/add-with-conversion" element={<div style={{ padding: 20 }}>Coming soon...</div>} />
        <Route path="/practice/order-of-operations/order-of-operations" element={<OrderOfOperations />} />
        <Route path="/practice/fractions/fraction" element={<FractionTest />} />
        <Route path="/practice/:subject/:testName" element={<div style={{ padding: 20 }}>Practice page coming soon...</div>} />
      </Routes>
    </Layout>
  );
}
