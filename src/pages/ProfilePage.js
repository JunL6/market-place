import React, { useEffect, useState } from "react";
import { Card, Loading, Tabs } from "element-react";
import { API, graphqlOperation } from "aws-amplify";
import { convertCentsToDollars } from "../utils";
import { S3Image } from "aws-amplify-react";

const getUserQuery = /* GraphQL */ `
	query GetUser($id: ID!) {
		getUser(id: $id) {
			email
			username
			orders {
				items {
					id
					createdAt
					product {
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

	console.log(cognitoUser.attributes.sub);

	async function getUserInfo() {
		if (cognitoUser && cognitoUser.attributes.sub) {
			try {
				const result = await API.graphql(
					graphqlOperation(getUserQuery, {
						id: cognitoUser.attributes.sub,
					})
				);

				setUserInfo(result.data.getUser);
			} catch (err) {
				console.error(`Error fetching User information`, err);
			}
		}
	}

	useEffect(() => {
		getUserInfo();
	}, [cognitoUser]);

	return (
		<>
			<Tabs type="card" className="profile-page">
				<Tabs.Pane
					label={
						<>
							<i className="el-icon-information"></i>
							<span>Summary</span>
						</>
					}
					name="1"
				>
					<h3>PROFILE SUMMARY</h3>
				</Tabs.Pane>
				<Tabs.Pane
					label={
						<>
							<i className="el-icon-document"></i>
							<span>Orders</span>
						</>
					}
					name="2"
				>
					{/* <Loading loading={!Boolean(userInfo)}> */}
					{userInfo &&
						userInfo.orders.items.map((order) => (
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
											// maxWidth: "100%",
											// maxHeight: "100%",
											width: "8em",
											height: "8em",
											objectFit: "cover",
											borderRadius: "20px",
										},
									}}
								/>
								<div className="order-content">
									<div className="product-name">
										{order.product.description}
									</div>
									<div>${convertCentsToDollars(order.product.price)}</div>
									<div>
										<small>{order.createdAt}</small>
									</div>
									<div>
										Shipping:{" "}
										{order.product.shipped ? (
											<div>
												<i>{order.shippingAddress.address_line1}</i>
												<div>
													<i>{`${order.shippingAddress.city}, ${order.shippingAddress.address_state}, ${order.shippingAddress.country}, ${order.shippingAddress.address_zip}`}</i>
												</div>
											</div>
										) : (
											`Via Email`
										)}
									</div>
								</div>
							</Card>
						))}
					{/* </Loading> */}
				</Tabs.Pane>
			</Tabs>
		</>
	);
}
