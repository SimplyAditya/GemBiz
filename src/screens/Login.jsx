import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 space-y-8">
        <div className="flex flex-col items-center">
          <img
            className="h-20 w-auto"
            src="/Group 3.png"
            alt="Go Extra Mile Logo"
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            GemBiz
          </h2>
          <p className="text-sm text-gray-500">One Stop For Your Shop</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="p-2 bg-gray-100 rounded">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Scratch Cards</h3>
                <p className="text-sm text-gray-500">
                  Create scratch cards for your business
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="p-2 bg-gray-100 rounded">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Increase your Business</h3>
                <p className="text-sm text-gray-500">
                  Increase customer recall after a ride
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="p-2 bg-gray-100 rounded">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Sell Products</h3>
                <p className="text-sm text-gray-500">
                  Sell products directly to your customers
                </p>
              </div>
            </div>
          </div>

          <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
            Sign up with mobile number
          </button>

          <p className="text-xs text-center text-gray-500">
            I agree to Go Extra Mile's{" "}
            <a href="#" className="text-blue-500">
              Terms & Conditions
            </a>
            ,{" "}
            <a href="#" className="text-blue-500">
              Privacy
            </a>
            ,{" "}
            <a href="#" className="text-blue-500">
              Cookies
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500">
              Advertising policies
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
