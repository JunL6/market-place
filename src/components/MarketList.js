import React, { useState, useEffect } from "react";
import { listMarkets } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { Loading, Card, Tag, Notification } from "element-react";
import { SiMarketo } from "react-icons/si";
import { Link } from "react-router-dom";
import { onCreateMarket } from "../graphql/subscriptions";

function sortByCreatedTimeAsc(a, b) {
	if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
		return 1;
	else return -1;
}

export default function MarketList() {
	const [markets, setMarkets] = useState(null);

	useEffect(() => {
		fetchMarkets();
	}, []);

	useEffect(() => {
		try {
			const createMarketSubscription = API.graphql(
				graphqlOperation(onCreateMarket)
			).subscribe({
				next: (marketData) => {
					const newMarket = marketData.value.data.onCreateMarket;
					setMarkets((prevMarkets) => {
						return [...prevMarkets, newMarket].sort(sortByCreatedTimeAsc);
					});
					Notification.success({
						title: "Success",
						message: "Added new market",
					});
				},
			});

			return function cleanup() {
				createMarketSubscription.unsubscribe();
			};
		} catch (error) {
			console.log(error);
		}
	}, []);

	async function fetchMarkets() {
		try {
			const result = await API.graphql({ query: listMarkets });
			console.log(result);
			setMarkets(result.data.listMarkets.items.sort(sortByCreatedTimeAsc));
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="market-list">
			<h2>
				<SiMarketo /> Markets
			</h2>
			<Loading text="loading markets..." loading={markets === null}>
				{markets && markets.length > 0 && (
					<div>
						{markets.map((market) => (
							<div className="market-list-item" key={market.id}>
								<Card
									bodyStyle={{
										display: "flex",
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<div className="market-list-item-left">
										<Link
											to={`/markets/${market.id}`}
											className="market-list-item-marketname"
										>
											<span>{market.name}</span>
										</Link>
										<span className="market-list-item-product">
											{`${
												market.products.length > 0 ? market.products.length : 0
											} products`}
										</span>
									</div>
									<div className="market-list-item-right">
										{market.tags &&
											market.tags.map((tag) => (
												<Tag type="danger" key={tag}>
													{tag}
												</Tag>
											))}
									</div>
								</Card>
							</div>
						))}
					</div>
				)}
			</Loading>
		</div>
	);
}
