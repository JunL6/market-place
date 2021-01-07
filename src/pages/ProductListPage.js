import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { searchProducts, listProducts } from "../graphql/queries";
import ProductSearchInput from "../components/ProductSearchInput";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import { Button } from "element-react";
import ProductList from "../components/ProductList";
import { onUpdateProduct } from "../graphql/subscriptions";

export default function ProductListPage() {
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

	/* Effect hook: onProductUpdate subscriber */
	useEffect(() => {
		const onProductUpdateListener = API.graphql(
			graphqlOperation(onUpdateProduct)
		).subscribe({
			next: ({ provider, value }) => {
				const updatedProduct = value.data.onUpdateProduct;

				setAllProductList((prevList) => {
					const updatedList = [
						updatedProduct,
						...prevList.filter((product) => product.id !== updatedProduct.id),
					];
					return updatedList.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING);
				});
			},
		});

		return function cleanup() {
			onProductUpdateListener.unsubscribe();
		};
	}, []);

	/* graphql operation for fetching all the products */
	async function fetchAllProducts() {
		try {
			const result = await API.graphql(graphqlOperation(listProducts));
			setAllProductList(result.data.listProducts.items);
		} catch (err) {
			console.error(`Error fetching all the products`, err);
		}
	}

	/* graphql operation for searching product by name */
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
