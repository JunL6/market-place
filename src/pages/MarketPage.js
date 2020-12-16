import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import { Link } from "react-router-dom";
import { Loading, Tabs, Icon, Button } from "element-react";
import NewProduct from "../components/NewProduct";
// import { useParams } from "react-router-dom";

export default function MarketPage({ user, marketId }) {
	const [market, setMarket] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchMarket();
	}, []);

	async function fetchMarket() {
		try {
			const fetchResult = await API.graphql(
				graphqlOperation(getMarket, {
					id: marketId,
				})
			);
			console.log(fetchResult);
			setMarket(fetchResult.data.getMarket);
			setIsLoading(false);
		} catch (err) {
			console.error(err);
		}
	}

	return isLoading ? (
		<Loading fullscreen></Loading>
	) : (
		<>
			<div className="back-nav-link">
				<Link to="/">
					<Button>
						<i className="el-icon-arrow-left" />
						<span>Back to Markets List</span>
					</Button>
				</Link>
			</div>
			<div className="market-name">
				<strong>{market.name}</strong> <span>{`By ${market.owner}`}</span>
			</div>
			<div>
				<i className="el-icon-date" /> <span>{market.createdAt}</span>
			</div>
			<Tabs
				className="market-page-tabs"
				type="border-card"
				value={market.owner === user.username ? "1" : "2"}
			>
				<Tabs.Pane
					disabled={user.username !== market.owner}
					label={
						<span>
							<Icon name="plus" />
							Add Product
						</span>
					}
					name="1"
					className="market-page-new-product"
				>
					<NewProduct marketId={marketId} />
				</Tabs.Pane>
				<Tabs.Pane
					label={
						<span>
							<Icon name="menu" />
							{`Products (${market.products.items.length})`}
						</span>
					}
					name="2"
				></Tabs.Pane>
			</Tabs>
		</>
	);
}
