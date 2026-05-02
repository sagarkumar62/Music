import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { useDispatch } from "react-redux";
import { resetSongState } from "../redux/features/songSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogin(event) {
    event.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response.data);

        // 🔥 IMPORTANT: clear old user's music state
        dispatch(resetSongState());

        navigate("/");
      })
      .catch((err) => {
        console.error("Login failed", err);
      });
  }

  return (
    <section className="login-section">
      <h1>Sound stream</h1>

      <div className="middle">
        <h1>Welcome back</h1>

        <form onSubmit={handleLogin}>
          <input id="username" type="text" placeholder="Username" />
          <input id="password" type="password" placeholder="Password" />
          <input type="submit" value={"Login"} />
        </form>
      </div>

      <p>
        create an account <Link to="/register">register</Link>
      </p>
    </section>
  );
};

export default Login;