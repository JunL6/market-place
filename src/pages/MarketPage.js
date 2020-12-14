import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { getMarket } from "../graphql/queries";
import { Link } from "react-router-dom";
import { Loading, Tabs, Icon } from "element-react";
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
			{console.log(user.username === market.owner)}
			<Link to="/">Back to Markets List</Link>
			<div>
				<strong>{market.name}</strong> <span>{market.owner}</span>
			</div>
			<div>
				<i className="el-icon-date" /> <span>{market.createdAt}</span>
			</div>
			<Tabs
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
				>
					<NewProduct />
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
