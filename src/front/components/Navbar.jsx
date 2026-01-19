import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-dark bg-dark">
			<div className="container ">
				<div className="d-flex align-items-center ms-auto">
					<div className="ml-auto m-2">
						<Link to="/Signup">
							<button className="btn btn-success">Signup</button>
						</Link>
					</div>
					<div className="ml-auto m-2">
						<Link to="/Login">
							<button className="btn btn-success">Login</button>
						</Link>
					</div>
					<div className="ml-auto m-2">
						<Link to="/">
							<button className="btn btn-success">Private</button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};