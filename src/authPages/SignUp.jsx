import React, { useState } from "react";
import { db } from "../services/database";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link , Navigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";

const SignUp = () => {
  //states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirmPass, setShowconfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useAuth();

  if(user && user.user_metadata?.role) {
      return <Navigate to="/dashboard/home" replace={true} />;
    }

  //functions
  const signUp = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //error validation
    if (typeof email !== "string" || !emailRegex.test(email) || !email) {
      alert("Invalid Email !");
      return;
    }
    if (!password) {
      alert("No password provided");
      return;
    }
    if (!name) {
      alert("seems like you don't have a name");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords are different!");
      return;
    }
    setIsLoading(true);
    try {
      const {data, error } = await db.auth.signUp({ email, password , options : { data : { username: name.toLowerCase().trim(), phone, role } } });

      if (error) {
        alert("Failed to sign up", error);
        console.error("sign up error :", error);
        return;
      }

      alert("Successfully signed up !");
      console.log(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="relative -screen w-full flex flex-col gap-3 items-start p-4 justify-center">
      <h2 className="text-3xl text-blue-800 text-center font-bold font-sans capitalize w-full">
        create your account
      </h2>
      <p className="text-lg text-gray-500 italic font-medium text-center">
        Join us today to access available propreties near you!
      </p>
      <div className="flex flex-col justify-center items-start gap-4 w-full ">
        <div className="flex flex-col gap-2 justify-center items-start w-full ">
          <label htmlFor="name" className="capitalize font-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="what's your name ?"
            className="w-full outline outline-gray-500 rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 justify-center items-start w-full ">
          <label htmlFor="email" className="capitalize font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="email@gmail.com"
            className="w-full outline outline-gray-500 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {role === "agent" && (
          <div className="flex flex-col gap-2 justify-center items-start w-full ">
            <label htmlFor="phone" className="capitalize font-semibold">
              whatsapp number
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="+237 699959447"
              className="w-full outline outline-gray-500 rounded p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-col gap-2 justify-center items-start w-full">
          <label htmlFor="password" className="capitalize font-semibold">
            password
          </label>
          <div className="flex justify-center items-center gap-1 outline outline-gray-500 rounded p-2 w-full">
            <input
              type={show ? "text" : "password"}
              id="password"
              placeholder="@d30K/16#45B"
              className="w-full outline-none flex-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => setShow(!show)}>
              {show ? (
                <FaEye className="size-5 text-blue-900" />
              ) : (
                <FaEyeSlash className="size-5 text-blue-900" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center items-start w-full">
          <label htmlFor="Cpassword" className="capitalize font-semibold">
            Confirm Password
          </label>
          <div className="flex justify-center items-center gap-1 outline outline-gray-500 rounded p-2 w-full">
            <input
              type={showConfirmPass ? "text" : "password"}
              id="Cpassword"
              placeholder="@d30K/16#45B"
              className="w-full outline-none flex-1"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={() => setShowconfirmPass(!showConfirmPass)}>
              {showConfirmPass ? (
                <FaEye className="size-5 text-blue-900" />
              ) : (
                <FaEyeSlash className="size-5 text-blue-900" />
              )}
            </button>
          </div>
        </div>
        <div className="w-full p-2 flex justify-start items-center gap-4">
          <div className="flex justify-center items-center text-lg">I am</div>
          <div className="flex gap-3 justify-center items-center">
            <button
              className={`rounded-lg text-lg text-white font-medium p-2 ease-in-out transition-all ${role === "tenant" ? "bg-blue-800" : "bg-blue-500"}`}
              onClick={() => setRole("tenant")}
            >
              {" "}
              a Tenant
            </button>
            <button
              className={`rounded-lg text-lg text-white font-medium p-2 ease-in-out transition-all ${role === "agent" ? "bg-blue-800" : "bg-blue-500"}`}
              onClick={() => setRole("agent")}
            >
              an Agent
            </button>
          </div> 
        </div>
        <button
          className="p-2 w-50 capitalize rounded bg-blue-500 text-white text-lg"
          onClick={signUp}
        >
          {isLoading ? "Loading..." : "sign up"}
        </button>
      </div>
      <div className="text-lg text-center font-medium w-full absolute bottom-1">
        Have an account ?{" "}
        <Link to={"/signin"} className="text-blue-800 capitalize font-medium">
          sign in
        </Link>
      </div>
    </main>
  );
};

export default SignUp;
