import React from "react";
import LandingPage from "./authPages/LandingPage";
import { Route, Routes } from "react-router-dom";
import SignIn from "./authPages/SignIn";
import SignUp from "./authPages/SignUp";
import ResetPass from "./authPages/ResetPass";
import Dashboard from "./screens/Dashboard";
import Home from "./screens/Home";
import Explore from "./screens/Explore";
import AddProp from "./screens/AddProp";
import Favorite from "./screens/Favorite";
import Profile from "./screens/Profile";
import { SecureRoute } from "./utils/SecureRouting";

const App = () => {
  return (
    <main className="w-full min-h-screen flex justify-center">
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<SignIn />} path="/signin" />
        <Route element={<SignUp />} path="/signup" />
        <Route element={<ResetPass />} path="/reset" />
        <Route element={<AddProp />} path="/add" />
        <Route element={<SecureRoute />}>
          <Route element={<Dashboard />} path="/dashboard">
            <Route index element={<Home />} path="home" />
            <Route element={<Explore />} path="explore" />
            <Route element={<Favorite />} path="favorite" />
            <Route element={<Profile />} path="profiles" />
          </Route>
        </Route>
      </Routes>
    </main>
  );
};

export default App;
