"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Presentations from "@/components/Presentations";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-genel">
      {/* Siyah yarı saydam katman - fixed to stay with background */}
      <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

      {/* İçerik */}
      <div className="relative min-h-screen text-black flex flex-col z-20">
        <Navbar />
        <div className="flex justify-center items-center">
          <Presentations />
        </div>
      </div>
    </div>
  );
}
