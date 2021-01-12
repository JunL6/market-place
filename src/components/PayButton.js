import { API, graphqlOperation } from "aws-amplify";
import { Loading, Message, Notification } from "element-react";
import React, { useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { createOrder } from "../graphql/mutations";
// import { IsLoadingContext } from "../pages/MarketPage";
import { getUser } from "../graphql/queries";
import { browserHistory } from "../App";

const stripeConfig = {
	currency: "USD",
	publishableAPIKey:
		"pk_test_51I0kZJHO14SglYyweDsZ0166SNqMHKjaWQnKS9Px3shOxp7KL1LCzVs2k8lxO5uSr77Y810hP23At0qacJr5r4qT00YIZoldhM",
};

export default function PayButton({ product, user }) {
	async function getProductOwner() {
		try {
			const result = await API.graphql(
				graphqlOperation(getUser, {
					id: product.owner,
				})
			);
			return result.data.getUser.email;
		} catch (err) {
			console.error(`Error fetching product owener`, err);
		}
	}

	async function handleToken(token) {
		const productOwnerEmail = await getProductOwner();
		console.log(productOwnerEmail);
		console.log(token);
		// setIsProcessingPayment(true);
		try {
			const result = await API.post("orderprocessor", "/charge", {
				body: {
					token,
					charge: {
						currency: stripeConfig.currency,
						amount: product.price,
						description: product.description,
						productOwnerEmail,
						shipped: product.shipped,
						customerEmail: user.user.attributes.email,
					},
				},
			});
			if (result && result.charge.status === `succeeded`) {
				/* create order: graphql operation */
				const shippingAddress = product.shipped
					? {
							city: result.charge.source.address_city,
							country: result.charge.source.address_country,
							address_line1: result.charge.source.address_line1,
							// address_line2: result.charge.source.address_line2,
							address_state: result.charge.source.address_state,
							address_zip: result.charge.source.address_zip,
					  }
					: null;

				const createOrderResult = await API.graphql(
					graphqlOperation(createOrder, {
						input: {
							orderProductId: product.id,
							userID: user.user.attributes.sub,
							shippingAddress,
						},
					})
				);

				console.log(createOrderResult);
				// setIsProcessingPayment(false);
				Notification.success({
					title: "Success",
					message: "Purchase Success!",
				});

				setTimeout(() => {
					browserHistory.push("/");
					Message({
						message: "Check your verified email for order details",
						type: "success",
						showClose: true,
					});
				}, 3000);
			} else {
				Notification.error({
					title: "Error",
					message: "Failed to Process Payment",
				});
			}

			console.log(result);
		} catch (err) {
			console.error(`Error Handling Payment`, err);
			Notification.error({
				title: "Error",
				message: "Failed to Process Payment",
			});
		} finally {
			// setIsLoading(false);
		}
	}

	return (
		// <Loading
		// 	loading={false}
		// 	fullscreen={true}
		// 	text="Processing your payment..."
		// >
		<StripeCheckout
			token={handleToken}
			name={product.description}
			email={user.user.attributes.email}
			amount={product.price}
			shippingAddress={product.shipped}
			billingAddress={product.shipped}
			alipay={true}
			locale="auto"
			currency={stripeConfig.currency}
			stripeKey={stripeConfig.publishableAPIKey}
		/>
	);
}
