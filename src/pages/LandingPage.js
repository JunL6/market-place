import { Button } from "element-react";
import React from "react";
import { FaSellsy } from "react-icons/fa";
import bg from "../landing-page-bg.png";

export default function LandingPage({ setIsLandingPage }) {
	return (
		<div className="landing-page">
			<img src={bg} className="landing-page-bg" />
			<div className="logo">
				<FaSellsy color="orange" size="2em" />
				<span className="app-name">Market Place</span>
			</div>
			<div className="content-wrapper">
				<div className="content">
					<h2>Selling Used Items Made Easy!</h2>
					<p>
						Getting money back from selling used items has never been easier.
						Simply by uploading the photo and filling up the description, BOOM!
						That's it.
					</p>
					<Button
						size="large"
						className="signup-btn"
						onClick={() => setIsLandingPage(false)}
					>
						Sign In
					</Button>
				</div>
			</div>
		</div>
	);
}
