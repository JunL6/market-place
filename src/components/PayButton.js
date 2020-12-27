import { API, graphqlOperation } from "aws-amplify";
import { Notification } from "element-react";
import React, { useContext } from "react";
import StripeCheckout from "react-stripe-checkout";
// import { IsLoadingContext } from "../pages/MarketPage";
import { getUser } from "../graphql/queries";

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
			if (result && result.message === `Order Processed Successfully!`) {
				Notification.success({
					title: "Success",
					message: "Purchase Success!",
				});
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
