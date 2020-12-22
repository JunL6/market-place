import React from "react";
import StripeCheckout from "react-stripe-checkout";

const stripeConfig = {
	currency: "USD",
	publishableAPIKey:
		"pk_test_51I0kZJHO14SglYyweDsZ0166SNqMHKjaWQnKS9Px3shOxp7KL1LCzVs2k8lxO5uSr77Y810hP23At0qacJr5r4qT00YIZoldhM",
};

export default function PayButton({ product, user }) {
	return (
		<StripeCheckout
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
