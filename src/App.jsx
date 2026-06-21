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
import PropertyDetails from "./screens/PropertyDetails";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import FAQ from "./screens/FAQ";
import Terms from "./screens/Terms";
import { SecureRoute } from "./utils/SecureRouting";
import Auth from "./authPages/Auth";
import Report from "./screens/Report";
import MyReports from "./screens/MyReports";
import Support from "./screens/Support";
import EditProfile from "./screens/EditProfile";

const App = () => {
  return (
    <main className="w-full min-h-screen flex justify-center">
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<Auth />} path="/auth" />
        <Route element={<SignIn />} path="/signin" />
        <Route element={<SignUp />} path="/signup" />
        <Route element={<ResetPass />} path="/reset" />
        <Route element={<PrivacyPolicy />} path="/privacy" />
        <Route element={<FAQ />} path="/faq" />
        <Route element={<Terms />} path="/terms" />
        <Route element={<AddProp />} path="/add" />
        <Route element={<SecureRoute />}>
          <Route element={<Dashboard />} path="/dashboard">
            <Route index element={<Home />} />
            <Route element={<Home />} path="home" />
            <Route element={<Explore />} path="explore" />
            <Route element={<Favorite />} path="favorite" />
            <Route element={<Profile />} path="profiles" />
            <Route element={<PropertyDetails />} path="property/:listingId" />
            <Route element={<Report />} path="property/report/:propertyId" />
            <Route element={<MyReports />} path="reports" />
            <Route element={<Support />} path="support" />
            <Route element={<EditProfile />} path="edit-profile" />
          </Route>
        </Route>
      </Routes>
    </main>
  );
};

export default App;
