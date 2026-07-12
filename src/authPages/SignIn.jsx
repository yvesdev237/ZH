import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { db } from "../services/database";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/UseAuth";

const SignIn = () => {
  const {user} = useAuth();
  //states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if(user && user.user_metadata?.role) {
    return <Navigate to="/dashboard/home" replace={true} />;
  }

  //functions
  const signIn = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //error validation
    if (typeof email !== "string" || !emailRegex.test(email) || !email) {
      toast.error("Invalid Email !");
      return;
    }
    if (!password) {
      toast.error("No password provided");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Failed to sign in");
        console.error("login error :", error);
      }else{
        toast.success('succefully signed In')
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="relative h-screen w-full flex flex-col gap-3 items-start p-4 justify-center bg-transparent">
      <h2 className="text-4xl text-blue-500 text-center font-bold font-sans capitalize w-full">
        welcome back !
      </h2>
      <p className="text-lg text-gray-500 italic font-medium text-center">
        Sign in to access available propreties near you!
      </p>
      <div className="flex flex-col justify-center items-start gap-4 w-full ">
        <div className="flex flex-col gap-2 justify-center items-start w-full ">
          <label htmlFor="email" className="capitalize font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="zilohome@gmail.com"
            className="w-full outline outline-gray-500 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 justify-center items-start w-full">
          <label htmlFor="password" className="capitalize font-semibold">
            password
          </label>
          <div className="flex justify-center items-center gap-1 outline outline-gray-500 rounded p-2 w-full">
            <input
              type={show ? 'text' : 'password'}
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
          <div className="text-lg capitalize text-right text-blue-800 font-medium w-full">
            <Link to={'/reset'} replace = {true} >forgot password ?</Link>
          </div>
        </div>
        <button
          className="p-2 w-50 capitalize rounded bg-blue-500 text-white text-lg"
          onClick={signIn}
        >
          {isLoading ? "Loading..." : "sign in"}
        </button>
      </div>
      <div className="text-lg text-center font-medium w-full absolute bottom-10">
            Don't have an account ? <Link to={'/signup'} replace = {true} className="text-blue-500 capitalize font-medium">sign up</Link>
          </div>
    </main>
  );
};

export default SignIn;
