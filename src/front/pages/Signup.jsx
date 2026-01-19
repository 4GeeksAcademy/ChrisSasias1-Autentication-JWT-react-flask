import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Signup = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [feedback, setFeedback] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        setFeedback({ type: "", text: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = form.username.trim();
        const email = form.email.trim();
        const password = form.password.trim();

        if (username === "" || email === "" || password === "") {
            setFeedback({ type: "error", text: "All fields are required." });
            return;
        }

        setIsLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const resp = await fetch(`${backendUrl}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await resp.json().catch(() => ({}));

            if (!resp.ok) {
                setFeedback({
                    type: "error",
                    text: data.msg || "Signup failed. Please try again.",
                });
                setIsLoading(false);
                return;
            }

            setFeedback({
                type: "success",
                text: data.msg || "Account created successfully.",
            });

            setForm({ username: "", email: "", password: "" });

            // (opcional) si querés avisar al store que se creó usuario:
            // dispatch({ type: "signup_success" });

            setIsLoading(false);
            navigate("/login");
            return;
        } catch (error) {
            console.error(error);
            setFeedback({
                type: "error",
                text: "Network error. Please try again later.",
            });
            setIsLoading(false);
            return;
        }
    };

    const alertClass =
        feedback.type === "error" ? "alert alert-danger" : "alert alert-success";

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-9 col-lg-6">
                    <div className="card bg-dark text-light shadow-lg border-0 rounded-4">
                        <div className="card-body p-4 p-md-5">
                            <h1 className="h3 fw-bold mb-3 d-flex justify-content-center">
                                Create account
                            </h1>

                            {feedback.text !== "" && (
                                <div className={alertClass} role="alert">
                                    {feedback.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="username">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-black text-light border-secondary"
                                            id="username"
                                            name="username"
                                            placeholder="My Username"
                                            value={form.username}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control bg-black text-light border-secondary"
                                            id="email"
                                            name="email"
                                            placeholder="you@email.com"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="password">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control bg-black text-light border-secondary"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            className="btn btn-success w-100 py-2 fw-semibold"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Creating..." : "Create account"}
                                        </button>
                                    </div>

                                    <div className="col-12 text-center mt-2">
                                        <span className="text-secondary">Already have an account?</span>{" "}
                                        <Link to="/login" className="btn btn-link text-light p-0">
                                            Sign in
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
