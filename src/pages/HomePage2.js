import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { searchProducts, listProducts } from "../graphql/queries";
import ProductSearchInput from "../components/ProductSearchInput";
import Product from "../components/Product";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import { Button } from "element-react";
import ProductList from "../components/ProductList";

export default function HomePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [searchResultList, setSearchResultList] = useState([]);
	const [currentSearchTerm, setCurrentSearchTerm] = useState("");
	const [shouldShowAllProducts, setShouldShowAllProducts] = useState(true);
	/* new states */
	const [allProductList, setAllProductList] = useState([]);

	/* Effect hook: get all the products */
	useEffect(() => {
		fetchAllProducts();
	}, []);

	async function fetchAllProducts() {
		try {
			const result = await API.graphql(graphqlOperation(listProducts));
			setAllProductList(result.data.listProducts.items);
		} catch (err) {
			console.error(`Error fetching all the products`, err);
		}
	}

	/* graphql operation for searching market by name or tags */
	async function handleSearchSubmit(event) {
		event.preventDefault();
		setIsSearchLoading(true);
		try {
			const searchResult = await API.graphql(
				graphqlOperation(searchProducts, {
					filter: {
						name: { wildcard: `*${searchTerm}*` },
					},
				})
			);

			console.log(searchResult);
			setSearchResultList(searchResult.data.searchProducts.items);
			setCurrentSearchTerm(searchTerm);
			setSearchTerm("");
			setShouldShowAllProducts(false);
			setIsSearchLoading(false);
		} catch (err) {
			console.error(`Error searching product`, err);
		}
	}

	function showAllProducts() {
		setShouldShowAllProducts(true);
		setSearchResultList([]);
	}

	function renderProducts(products) {
		return products.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING).map((product) => {
			return <Product key={product.id} product={product} />;
		});
	}

	return (
		<div>
			<ProductSearchInput
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				handleSearchSubmit={handleSearchSubmit}
				isSearchLoading={isSearchLoading}
			/>
			{shouldShowAllProducts ? (
				<ProductList products={allProductList} />
			) : (
				<div>
					<h2>
						<Button icon="arrow-left" onClick={showAllProducts} />
						<span className="search-result-text">
							{`showing search results for "${currentSearchTerm}": ${searchResultList.length} matching`}
						</span>
					</h2>
					<ProductList products={searchResultList} />
				</div>
			)}
		</div>
	);
}
