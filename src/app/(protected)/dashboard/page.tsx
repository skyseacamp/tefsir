'use client'

import React from "react";
import Navbar from "../../../components/Navbar"
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const {user} = useAuth()
  console.log(user)
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <h1>{user && user.role === "admin" ? "Admin Dashboard" : "Member Dashboard"}</h1>
    </div>
  );
};

export default DashboardPage;
