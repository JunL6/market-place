import React from "react";
import { Loading } from "element-react";
import { SiMarketo } from "react-icons/si";
import { Link } from "react-router-dom";
import { onCreateMarket } from "../graphql/subscriptions";
import MarketCard from "./MarketCard";

export default function MarketList({ markets }) {
	console.log(markets);

	/* graphql subscription for onCreateMarket */
	// useEffect(() => {
	// 	try {
	// 		const createMarketSubscription = API.graphql(
	// 			graphqlOperation(onCreateMarket)
	// 		).subscribe({
	// 			next: (marketData) => {
	// 				const newMarket = marketData.value.data.onCreateMarket;
	// 				setMarkets((prevMarkets) => {
	// 					return [...prevMarkets, newMarket].sort(sortByCreatedTimeAsc);
	// 				});
	// 				Notification.success({
	// 					title: "Success!",
	// 					message: "Added new market",
	// 				});
	// 			},
	// 		});

	// 		return function cleanup() {
	// 			createMarketSubscription.unsubscribe();
	// 		};
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// }, []);

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
