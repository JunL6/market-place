import { API } from "aws-amplify";
import { Notification } from "element-react";
import React, { useContext } from "react";
import StripeCheckout from "react-stripe-checkout";
// import { IsLoadingContext } from "../pages/MarketPage";

const stripeConfig = {
	currency: "USD",
	publishableAPIKey:
		"pk_test_51I0kZJHO14SglYyweDsZ0166SNqMHKjaWQnKS9Px3shOxp7KL1LCzVs2k8lxO5uSr77Y810hP23At0qacJr5r4qT00YIZoldhM",
};

export default function PayButton({ product, user }) {
	// const { setIsLoading } = useContext(IsLoadingContext);
	// console.log(setIsLoading);

	async function handleToken(token) {
		// setIsLoading(true);
		console.log(token);
		try {
			const result = await API.post(
				"orderprocessor",
				// "https://d24t6aoqzf5gkl.cloudfront.net/charge",
				"/charge",
				// "localhost:3000/charge",
				{
					body: {
						token,
						charge: {
							currency: stripeConfig.currency,
							amount: product.price,
							description: product.description,
						},
					},
				}
			);
			// if (result && result.status === "succeeded") {
			// 	Notification.success({
			// 		title: "Success",
			// 		message: "Purchase Success!",
			// 	});
			// } else {
			// 	Notification.error({
			// 		title: "Error",
			// 		message: "Failed to Process Payment",
			// 	});
			// }

			console.log(result);
		} catch (err) {
			console.log(err);
			// Notification.error({
			// 	title: "Error",
			// 	message: "Failed to Process Payment",
			// });
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
