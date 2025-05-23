"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./ForgotPasswordDoctor.css";
import Arrow from "./../assets/arrow-right.png";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("https://wellio-backend.onrender.com/doctor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setResetToken(data.resetToken);
        setStep("otpVerification");
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("https://wellio-backend.onrender.com/doctor/verify-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          resetCode: otp.join(""),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP Verified! Set a new password.");
        setStep("resetPassword");
      } else {
        setError(data.message || "Invalid OTP.");
      }
    } catch {
      setError("OTP verification failed.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("https://doord.onrender.com/doctor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to Sign In...");
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        setError(data.message || "Password reset failed.");
      }
    } catch {
      setError("Password reset failed.");
    }
  };

  return (
    <div>
      <div className="signup-container">
        {step === "email" && (
          <div>
            <div className="signupheads">
              <div className="head1 headd1">FORGOT PASSWORD</div>
            </div>
            <form onSubmit={handleSendOtp} className="inputs-form">
              <div className="input-order forgotpassinput">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <button className="signinbtn" type="submit">
                <div>Proceed</div>
                <Image src={Arrow} alt="Go" className="social-icon" width={40} height={40} />
              </button>
            </form>
          </div>
        )}

        {step === "otpVerification" && (
          <div>
            <div className="signupheads">
              <div className="head1">VERIFY OTP</div>
            </div>
            <form onSubmit={handleVerifyOtp} className="inputs-form">
              <div className="otp-container">
                {Array(6)
                  .fill("")
                  .map((_, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input"
                    />
                  ))}
              </div>
              <button className="signinbtn" type="submit">
                <div>Proceed</div>
                <Image src={Arrow} alt="Go" className="social-icon" width={40} height={40} />
              </button>
            </form>
          </div>
        )}

        {step === "resetPassword" && (
          <div>
            <div className="signupheads">
              <div className="head1 headd1">RESET PASSWORD</div>
            </div>
            <form onSubmit={handleResetPassword} className="inputs-form">
              <div className="input-order">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-order">
                <label>Re-Enter New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="signinbtn" type="submit">
                <div>Reset Password</div>
                <Image src={Arrow} alt="Go" className="social-icon" width={40} height={40} />
              </button>
            </form>
          </div>
        )}

        <div className="signupheads">
          {error && <div className="head2" style={{ color: "red" }}>{error}</div>}
          {message && <div className="head2" style={{ color: "green" }}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
