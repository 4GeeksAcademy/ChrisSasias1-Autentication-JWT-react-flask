import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (message.text !== "") {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    if (email === "" || password === "") {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const resp = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setMessage({
          type: "error",
          text: data.msg || "Login failed. Please check your credentials.",
        });
        return;
      }

      setMessage({ type: "success", text: data.msg || "Login successful." });

      if (data.token) {
        localStorage.setItem("jwt-token", data.token);
      }
      localStorage.setItem("login-status", "true");

      dispatch({ type: "LoggedIn" });

      setForm({ email: "", password: "" });

      navigate("/private");
      return;
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "Network error. Please try again later.",
      });
      return;
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card bg-dark text-light shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="text-ligth mb-4 d-flex justify-content-center">
                Sign in to continue
              </h3>

              {message.text !== "" && (
                <div
                  className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"
                    }`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="inputEmail4">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control bg-black text-light border-secondary"
                      id="inputEmail4"
                      placeholder="you@email.com"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="inputPassword4">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control bg-black text-light border-secondary"
                      id="inputPassword4"
                      placeholder="••••••••"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-success w-100 py-2 fw-semibold"
                    >
                      Sign in
                    </button>
                  </div>

                  <div className="col-12 text-center mt-2">
                    <span className="text-secondary">No account?</span>{" "}
                    <Link to="/signup" className="btn btn-link text-light p-0">
                      Create one
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

