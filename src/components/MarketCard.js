import { Card, Tag } from "element-react";
import React from "react";
import { Link } from "react-router-dom";

const cardBodyStyle = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	// backgroundColor: "rgba(233, 243, 254, 0.4)",
};

export default function MarketCard({ market }) {
	return (
		<div className="market-list-item">
			<Card bodyStyle={cardBodyStyle}>
				<div className="market-list-item-left">
					<Link
						to={`/markets/${market.id}`}
						className="market-list-item-marketname"
					>
						<span>{market.name}</span>
					</Link>
					<span className="market-list-item-product">
						{`${market.products.items.length} products`}
					</span>
				</div>
				<div className="market-list-item-right">
					{market.tags &&
						market.tags.map((tag) => (
							<Tag type="danger" key={tag}>
								{tag}
							</Tag>
						))}
				</div>
			</Card>
		</div>
	);
}
