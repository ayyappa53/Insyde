import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AuthStyles.css";

const Register = ({ switchToLogin }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validate = (data) => {
    const errors = {};

    if (!data.email) {
      errors.email = "Email is Required!";
    } else if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        String(data.email).toLowerCase()
      )
    ) {
      errors.email = "Email address is invalid!";
    }

    if (!data.password) {
      errors.password = "Password is Required";
    } else if (data.password.length < 6) {
      errors.password = "Password needs to be 6 character or more";
    }

    if (!data.name.trim()) {
      errors.name = "Username is Required!";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirm the Password";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = "Password is not match!";
    }

    if (!data.isAccepted) {
      errors.isAccepted = "Accept terms!";
    }

    return errors;
  };

  React.useEffect(() => {
    setErrors(validate(data));
  }, [data, touched]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  const registerUser = async (userData) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        showMessage("Registration successful! Redirecting to dashboard...", "success");
        localStorage.setItem('token', responseData.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        showMessage(responseData.message || "Registration failed", "error");
      }
    } catch (error) {
      showMessage("Server error. Please try again later.", "error");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeHandler = (event) => {
    if (event.target.name === "isAccepted") {
      setData({ ...data, [event.target.name]: event.target.checked });
    } else {
      setData({ ...data, [event.target.name]: event.target.value });
    }
  };

  const focusHandler = (event) => {
    setTouched({ ...touched, [event.target.name]: true });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (Object.keys(errors).length === 0) {
      registerUser(data);
    } else {
      showMessage("Please check fields again", "error");
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        isAccepted: true,
      });
    }
  };

  return (
    <div className="auth-container">
      {message.text && (
        <div className={`message-toast ${message.type}`}>{message.text}</div>
      )}

      <form className="auth-form" onSubmit={submitHandler} autoComplete="off">
        <h2>Sign Up</h2>
        <div>
          <div
            className={
              errors.name && touched.name
                ? "input-error"
                : !errors.name && touched.name
                ? "input-success"
                : ""
            }
          >
            <input
              type="text"
              name="name"
              value={data.name}
              placeholder="Name"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
            />
            <span className="input-icon user-icon"></span>
          </div>
          {errors.name && touched.name && (
            <span className="error-message">{errors.name}</span>
          )}
        </div>
        <div>
          <div
            className={
              errors.email && touched.email
                ? "input-error"
                : !errors.email && touched.email
                ? "input-success"
                : ""
            }
          >
            <input
              type="text"
              name="email"
              value={data.email}
              placeholder="E-mail"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
            />
            <span className="input-icon email-icon"></span>
          </div>
          {errors.email && touched.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>
        <div>
          <div
            className={
              errors.password && touched.password
                ? "input-error"
                : !errors.password && touched.password
                ? "input-success"
                : ""
            }
          >
            <input
              type="password"
              name="password"
              value={data.password}
              placeholder="Password"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
            />
            <span className="input-icon password-icon"></span>
          </div>
          {errors.password && touched.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>
        <div>
          <div
            className={
              errors.confirmPassword && touched.confirmPassword
                ? "input-error"
                : !errors.confirmPassword && touched.confirmPassword
                ? "input-success"
                : ""
            }
          >
            <input
              type="password"
              name="confirmPassword"
              value={data.confirmPassword}
              placeholder="Confirm Password"
              onChange={changeHandler}
              onFocus={focusHandler}
              autoComplete="off"
            />
            <span className="input-icon password-icon"></span>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>
        <div>
          <div className="terms-container">
            <input
              type="checkbox"
              name="isAccepted"
              checked={data.isAccepted}
              id="accept"
              onChange={changeHandler}
              onFocus={focusHandler}
            />
            <label htmlFor="accept">I accept terms of privacy policy</label>
          </div>
          {errors.isAccepted && touched.isAccepted && (
            <span className="error-message">{errors.isAccepted}</span>
          )}
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
          <span className="form-link">
            Already have an account?{" "}
            <a href="#" onClick={switchToLogin}>
              Sign In
            </a>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;