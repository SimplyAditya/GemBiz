import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Authentication = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loginOTP, setLoginOTP] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (step === "otp" && isOpen) {
      setTimer(60);
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerIntervalRef.current);
            setStep("credentials");
            setError("OTP expired. Please try again.");
            setOtp(new Array(6).fill(""));
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [step, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("https://gem-biz.onrender.com/login", {
        email,
        password,
      });
      if (response.status === 200) {
        setStep("otp");
        setLoginOTP(response.data.otp);
        localStorage.setItem("username", response.data.user.name);
      } else {
        setError("Incorrect credentials. Please try again.");
      }
    } catch (err) {
      if (err.response) {
        setError("Incorrect credentials. Please try again.");
      } else if (err.request) {
        setError("Network error. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const enteredOtp = otp.join("");

    if (enteredOtp == parseInt(loginOTP)) {
      console.log("OTP verified successfully.");
      localStorage.setItem("isLoggedIn", true);
      navigate("/dashboard/home");
      handleClose();
    } else {
      console.log("OTP verification failed.");
      setError("Wrong OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpInputRefs.current[index - 1]
    ) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleClose = () => {
    setStep("credentials");
    setEmail("");
    setPassword("");
    setOtp(new Array(6).fill(""));
    setError("");
    setLoading(false);
    clearInterval(timerIntervalRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xs flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md">
        {step === "credentials" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
            {error && (
              <p className="text-red-500 text-xs italic mb-4 text-center">
                {error}
              </p>
            )}
            <form onSubmit={handleCredentialsSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Enter OTP
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              An OTP has been sent to your email.
            </p>
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  OTP
                </label>
                <div className="flex justify-between space-x-2">
                  {otp.map((data, index) => {
                    return (
                      <input
                        key={index}
                        type="text"
                        name="otp"
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-lg"
                        maxLength="1"
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onFocus={(e) => e.target.select()}
                      />
                    );
                  })}
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-xs italic mt-2 mb-2 text-center">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Time remaining: {timer}s
            </p>
          </>
        )}

        <button
          onClick={handleClose}
          className="mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-800"
          disabled={loading}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Authentication;
