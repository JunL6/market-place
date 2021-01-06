import React from "react";
import { Loading } from "element-react";
import MarketCard from "./MarketCard";

export default function MarketList({ markets }) {
	console.log(markets);

	return (
		<div className="market-list">
			<Loading text="loading markets..." loading={markets === undefined}>
				{markets && markets.length > 0 && (
					<div>
						{markets.map((market) => (
							<MarketCard market={market} key={market.id} />
						))}
					</div>
				)}
			</Loading>
		</div>
	);
}
