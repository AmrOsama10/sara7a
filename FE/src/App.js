import React from "react";
import { GoogleLogin } from "@react-oauth/google";

function App() {
  const handleGoogleLoginSuccess = async (response) => {
    const idToken = response.credential;
    console.log(idToken);
    try {
      const backendResponse = await fetch(
        "http://localhost:3000/auth/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        }
      );

      const result = await backendResponse.json();
      if (backendResponse.ok) {
        console.log("Login successful:", result);
        localStorage.setItem("token", result.data.token);
      } else {
        console.error("Error:", result);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div>
      <h1>Google Login</h1>
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default App;
