import React, { useEffect, useState } from "react";
import { Loading, Table, Tabs } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import { SiMarketo } from "react-icons/si";
import OrderCard from "../components/OrderCard";
import { listProducts } from "../graphql/queries";
import ProductList from "../components/ProductList";
import MarketList from "../components/MarketList";

const getUserQuery = /* GraphQL */ `
	query GetUser($id: ID!) {
		getUser(id: $id) {
			email
			username
			orders(sortDirection: DESC) {
				items {
					id
					createdAt
					product {
						name
						description
						owner
						price
						shipped
						market {
							name
						}
						file {
							key
						}
					}
					shippingAddress {
						address_line1
						address_state
						address_zip
						city
						country
					}
				}
			}
		}
	}
`;

/* the query provided by codegen does not query products item  */
const listMarkets = /* GraphQL */ `
	query ListMarkets(
		$filter: ModelMarketFilterInput
		$limit: Int
		$nextToken: String
	) {
		listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
			items {
				id
				name
				tags
				owner
				createdAt
				products {
					items {
						name
					}
				}
				updatedAt
			}
			nextToken
		}
	}
`;

export default function ProfilePage({ cognitoUser }) {
	const [userInfo, setUserInfo] = useState();
	const [userMarketList, setUserMarketList] = useState();
	const [userProductList, setUserProductList] = useState();
	console.log(cognitoUser);

	/* columns for <Table /> */
	const columns = [
		{
			prop: "name",
			// width: 200,
		},
		{
			prop: "value",
			// width: 400,
		},
	];

	/* Effect Hook */
	useEffect(() => {
		getUserInfo();
		getUserProducts();
		getUserMarkets();
	}, [cognitoUser]);

	async function getUserInfo() {
		if (cognitoUser && cognitoUser.attributes.sub) {
			try {
				const result = await API.graphql(
					graphqlOperation(getUserQuery, {
						id: cognitoUser.attributes.sub,
					})
				);

				// console.log(result.data.getUser);
				setUserInfo(result.data.getUser);
			} catch (err) {
				console.error(`Error fetching User information`, err);
			}
		}
	}

	async function getUserProducts() {
		if (cognitoUser && cognitoUser.attributes.sub) {
			try {
				const result = await API.graphql(
					graphqlOperation(listProducts, {
						filter: {
							owner: {
								eq: cognitoUser.attributes.sub,
							},
						},
					})
				);

				setUserProductList(result.data.listProducts.items);
			} catch (err) {
				console.error(`Error fetching user's products`);
			}
		}
	}

	async function getUserMarkets() {
		if (cognitoUser && cognitoUser.attributes.sub) {
			try {
				const result = await API.graphql(
					graphqlOperation(listMarkets, {
						filter: {
							owner: {
								eq: cognitoUser.attributes.sub,
							},
						},
					})
				);

				setUserMarketList(
					result.data.listMarkets.items.sort(
						COMPARE_NOTES_CREATEDTIME_ASCENDING
					)
				);
			} catch (err) {
				console.error(`Error fetching user's markets`);
			}
		}
	}

	return (
		<>
			{console.log(userMarketList)}
			<Tabs type="card" className="profile-page">
				<Tabs.Pane
					className="summary tab"
					label={
						<>
							<i className="el-icon-information"></i>
							<span>Account</span>
						</>
					}
					name="1"
				>
					<h3>ACCOUNT SUMMARY</h3>
					<Table
						className="user-profile-table"
						stripe={true}
						showHeader={false}
						columns={columns}
						border={true}
						data={[
							{ name: "Your Id", value: cognitoUser.attributes.sub },
							{ name: "Username", value: cognitoUser.username },
							{
								name: "Your Email",
								value: cognitoUser.attributes.email,
							},
							{
								name: "Phone Number",
								value: cognitoUser.attributes.phone_number,
							},
						]}
					/>
				</Tabs.Pane>
				<Tabs.Pane
					label={
						<>
							<SiMarketo />
							<span>My Markets</span>
						</>
					}
					name="2"
					className="markets-tab"
				>
					<Loading text="Loading..." loading={!userMarketList}>
						{userMarketList && userMarketList.length > 0 ? (
							<MarketList markets={userMarketList} />
						) : (
							<h3>You haven't created any market yet.</h3>
						)}
					</Loading>
					{/* {userMarketList ? (
						<MarketList markets={userMarketList} />
					) : (
						<h3>Loading...</h3>
					)} */}
				</Tabs.Pane>
				<Tabs.Pane
					label={
						<>
							<i className="el-icon-menu" />
							<span>My Products</span>
						</>
					}
					name="3"
					className="products-tab"
				>
					<Loading text="Loading..." loading={!userProductList}>
						{userProductList && userProductList.length > 0 ? (
							<ProductList products={userProductList} />
						) : (
							<h3>You haven't post any product yet.</h3>
						)}
					</Loading>
				</Tabs.Pane>
				<Tabs.Pane
					className="orders"
					label={
						<>
							<i className="el-icon-document"></i>
							<span>Orders</span>
						</>
					}
					name="4"
				>
					{userInfo && userInfo.orders.items.length > 0 ? (
						userInfo.orders.items
							.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING)
							.map((order) => <OrderCard key={order.id} order={order} />)
					) : (
						<h3>You haven't placed any order yet.</h3>
					)}
				</Tabs.Pane>
			</Tabs>
		</>
	);
}
