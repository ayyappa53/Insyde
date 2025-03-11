import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AuthStyles.css";

const Login = ({ switchToRegister }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

 
  const validate = (data) => {
    const errors = {};
    
    if (!data.email) {
      errors.email = "Email is required";
    }
    
    if (!data.password) {
      errors.password = "Password is required";
    }
    
    return errors;
  };

  React.useEffect(() => {
    setErrors(validate(data));
  }, [data]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  const loginUser = async (userData) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        showMessage("Login successful! Redirecting to dashboard...", "success");
        localStorage.setItem('token', responseData.token);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        showMessage(responseData.message || "Invalid email or password", "error");
      }
    } catch (error) {
      showMessage("Server error. Please try again later.", "error");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeHandler = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const focusHandler = (event) => {
    setTouched({ ...touched, [event.target.name]: true });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (Object.keys(validate(data)).length === 0) {
      loginUser(data);
    } else {
      showMessage("Please check fields again", "error");
      setTouched({
        email: true,
        password: true,
      });
    }
  };

  return (
    <div className="auth-container">
      {message.text && (
        <div className={`message-toast ${message.type}`}>{message.text}</div>
      )}

      <form className="auth-form" onSubmit={submitHandler} autoComplete="off">
        <h2>Sign In</h2>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <span className="form-link">
            Don't have an account?{" "}
            <a href="#" onClick={switchToRegister}>
              Create account
            </a>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;