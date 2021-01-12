import React from "react";
import { FaSellsy } from "react-icons/fa";
import bg from "../landing-page-bg.png";

export default function LandingPage() {
	return (
		<div>
			<img src={bg} className="landing-page-bg" />
			<div>
				<FaSellsy color="orange" size="2em" />
				<span className="app-name">Market Place</span>
			</div>
			<div>
				<h3>Buy and Sell Used Items</h3>
			</div>
		</div>
	);
}
