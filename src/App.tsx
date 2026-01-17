import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Test from "./pages/Test";
import AddWithoutConversion from "./pages/AddWithoutConversion";
import FractionTest from "./pages/FractionTest";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/10/add-without-conversion" element={<AddWithoutConversion />} />
        <Route path="/test/13/fraction" element={<FractionTest />} />
        <Route path="/test/:level/:testName" element={<div style={{ padding: 20 }}>Test page coming soon...</div>} />
      </Routes>
    </Layout>
  );
}
