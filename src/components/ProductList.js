import React from "react";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import Product from "./Product";

export default function ProductList({ products }) {
	function renderProducts(products) {
		return products.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING).map((product) => {
			return <Product key={product.id} product={product} />;
		});
	}

	return <div className="product-list">{renderProducts(products)}</div>;
}
