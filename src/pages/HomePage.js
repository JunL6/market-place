import React from "react";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";

export default function HomePage() {
	return (
		<div>
			homepage
			<NewMarket />
			<MarketList />
		</div>
	);
}
