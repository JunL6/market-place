import React, { useState, useEffect } from "react";
import { listMarkets } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import { Loading, Card, Tag, Notification, Icon, Button } from "element-react";
import { SiMarketo } from "react-icons/si";
import { Link } from "react-router-dom";
import { onCreateMarket } from "../graphql/subscriptions";

function sortByCreatedTimeAsc(a, b) {
	if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
		return 1;
	else return -1;
}

const cardBodyStyle = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	// backgroundColor: "rgba(233, 243, 254, 0.4)",
};

export default function MarketList(props) {
	const [markets, setMarkets] = useState(null);
	const [currentSearchTerm, setCurrentSearchTerm] = useState("");

	useEffect(() => {
		fetchMarkets();
	}, []);

	/* graphql subscription for onCreateMarket */
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
						title: "Success!",
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

	/* graphql operatino for getting list of markets for the current user */
	async function fetchMarkets() {
		try {
			const result = await API.graphql({ query: listMarkets });
			console.log(result);
			setMarkets(result.data.listMarkets.items.sort(sortByCreatedTimeAsc));
		} catch (err) {
			console.log(err);
		}
	}

	function renderMarketList(markets) {
		return (
			<Loading text="loading markets..." loading={markets === null}>
				{markets && markets.length > 0 && (
					<div>
						{markets.map((market) => (
							<div className="market-list-item" key={market.id}>
								<Card bodyStyle={cardBodyStyle}>
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
		);
	}

	return (
		<div className="market-list">
			{props.shouldShowAllMarkets ? (
				<>
					<h2>
						<SiMarketo /> Markets
					</h2>
					{renderMarketList(markets)}
				</>
			) : (
				<div>
					<h2>
						<Button icon="arrow-left" onClick={props.showAllMarkets} />
						<span className="search-result-text">
							{`showing search results for "${props.currentSearchTerm}": ${props.searchResultList.length} matching`}
						</span>
					</h2>
					{renderMarketList(props.searchResultList.sort(sortByCreatedTimeAsc))}
				</div>
			)}
		</div>
	);
}
