import { S3Image } from "aws-amplify-react";
import { Card } from "element-react";
import React from "react";
import { convertCentsToDollars, displayDate, displayTime } from "../utils";

export default function OrderCard({ order }) {
	return (
		<Card className="order-card" bodyStyle={{ display: "flex", width: "40em" }}>
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
					<small>{`${displayDate(new Date(order.createdAt))} ${displayTime(
						new Date(order.createdAt)
					)}`}</small>
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
	);
}
