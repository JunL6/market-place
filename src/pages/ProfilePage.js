import React, { useEffect, useState } from "react";
import { Card, Loading, Table, Tabs } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import {
	COMPARE_NOTES_CREATEDTIME_ASCENDING,
	convertCentsToDollars,
	displayDate,
	displayTime,
} from "../utils";
import { S3Image } from "aws-amplify-react";

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

	console.log(cognitoUser);

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

	useEffect(() => {
		getUserInfo();
	}, [cognitoUser]);

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

	return (
		<>
			<Tabs type="card" className="profile-page">
				<Tabs.Pane
					className="summary"
					label={
						<>
							<i className="el-icon-information"></i>
							<span>Account</span>
						</>
					}
					name="1"
				>
					<h3>PROFILE SUMMARY</h3>
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
					className="orders"
					label={
						<>
							<i className="el-icon-document"></i>
							<span>Orders</span>
						</>
					}
					name="2"
				>
					{userInfo && userInfo.orders.items.length > 0 ? (
						userInfo.orders.items
							.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING)
							.map((order) => (
								<Card
									className="order-card"
									key={order.id}
									bodyStyle={{ display: "flex", width: "40em" }}
								>
									<S3Image
										className="product-image"
										imgKey={order.product.file.key}
										theme={{
											photoImg: {
												width: "8em",
												height: "8em",
												objectFit: "cover",
												borderRadius: "8px",
											},
										}}
									/>
									<div className="order-content">
										<div className="product-name">{order.product.name}</div>
										<div>${convertCentsToDollars(order.product.price)}</div>
										<div>
											<small>{`${displayDate(
												new Date(order.createdAt)
											)} ${displayTime(new Date(order.createdAt))}`}</small>
										</div>
										<div>
											Shipping:{" "}
											{order.product.shipped
												? // <div>
												  // 	<i>{order.shippingAddress.address_line1}</i>
												  // 	<div>
												  // 		<i>{`${order.shippingAddress.city}, ${order.shippingAddress.address_state}, ${order.shippingAddress.country}, ${order.shippingAddress.address_zip}`}</i>
												  // 	</div>
												  // </div>
												  `Delivery`
												: `Via Email`}
										</div>
									</div>
								</Card>
							))
					) : (
						<h3>You haven't placed any order yet.</h3>
					)}
				</Tabs.Pane>
			</Tabs>
		</>
	);
}
