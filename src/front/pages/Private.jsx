import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [feedback, setFeedback] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
            const token = localStorage.getItem("jwt-token");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            if (!token) {
                setFeedback({ type: "error", text: "You must be logged in to view this page." });
                setIsLoading(false);
                navigate("/login");
                return;
            }

            try {
                const resp = await fetch(`${backendUrl}/private`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await resp.json().catch(() => ({}));

                if (!resp.ok) {
                    setFeedback({
                        type: "error",
                        text: data.msg || "Session expired. Please log in again.",
                    });
                    localStorage.removeItem("jwt-token");
                    localStorage.removeItem("login-status");
                    setIsLoading(false);
                    navigate("/login");
                    return;
                }

                setUsername(data.username || "");
                setFeedback({ type: "", text: "" });
                setIsLoading(false);
                return;
            } catch (err) {
                console.error(err);
                setFeedback({ type: "error", text: "Network error. Please try again later." });
                setIsLoading(false);
                return;
            }
        };

        verify();
    }, [navigate]);

    const alertClass =
        feedback.type === "error" ? "alert alert-danger" : "alert alert-success";

    return (
        <div className="bg-dark text-white text-center vh-100 pt-5 pb-5">
            <div className="container">
                <h1>This is a private page</h1>

                {isLoading && <p className="text-secondary mt-3">Loading...</p>}

                {!isLoading && feedback.text !== "" && (
                    <div className={alertClass} role="alert">
                        {feedback.text}
                    </div>
                )}

                {!isLoading && feedback.text === "" && (
                    <h2 className="mt-3">Welcome {username}</h2>
                )}
            </div>
        </div>
    );
};
