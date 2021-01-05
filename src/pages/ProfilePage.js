import React, { useEffect, useState } from "react";
import { Loading, Table, Tabs } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import { SiMarketo } from "react-icons/si";
import OrderCard from "../components/OrderCard";
import { listProducts } from "../graphql/queries";
import ProductList from "../components/ProductList";

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

export default function ProfilePage({ cognitoUser }) {
	const [userInfo, setUserInfo] = useState();
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

	return (
		<>
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
				></Tabs.Pane>
				<Tabs.Pane
					label={
						<>
							<i className="el-icon-menu" />
							<span>My Products</span>
						</>
					}
					name="3"
				>
					{userProductList ? (
						<ProductList products={userProductList} />
					) : (
						<h3>Loading...</h3>
					)}
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
