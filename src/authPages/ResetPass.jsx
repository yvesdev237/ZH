import React , {useState} from 'react'
import { db } from '../services/database';

const ResetPass = () => {
  //states
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //functions
  const reset = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //error validation
    if (typeof email !== "string" || !emailRegex.test(email) || !email) {
      alert("Invalid Email !");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await db.auth.resetPasswordForEmail({email})
      if (error) {
        alert("Failed to reset", error);
        console.error("reset error :", error);
        return;
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="relative -screen w-full flex flex-col gap-3 items-start p-4 justify-center">
      <h2 className="text-3xl text-blue-800 text-center font-bold font-sans capitalize w-full">
        reset your password
      </h2>
      <p className="text-lg text-gray-500 italic font-medium text-center">
        You've forgotten your password ? just enter the email address related to your account.
      </p>
      <div className="flex flex-col justify-center items-start gap-4 w-full ">
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
        <button
          className="p-2 w-50 capitalize rounded bg-blue-900 text-white text-lg"
          onClick={reset}
        >
          {isLoading ? "Loading..." : "reset "}
        </button>
      </div>
    </main>
  );
}

export default ResetPass