import React, { useState, useEffect } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
// import { getMarket } from "../graphql/queries";
import { Link } from "react-router-dom";
import { Loading, Tabs, Icon, Button } from "element-react";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import {
	onCreateProduct,
	onUpdateProduct,
	onDeleteProduct,
} from "../graphql/subscriptions";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils"; // import { useParams } from "react-router-dom";

/* the query generated by AWS does not have the ~file~ field, so I added it here */
const getMarket = /* GraphQL */ `
	query GetMarket($id: ID!) {
		getMarket(id: $id) {
			id
			name
			tags
			owner
			createdAt
			products {
				items {
					id
					description
					price
					shipped
					owner
					createdAt
					marketID
					updatedAt
					file {
						key
					}
				}
				nextToken
			}
			updatedAt
		}
	}
`;

export default function MarketPage({ user, marketId }) {
	const [market, setMarket] = useState();
	const [isLoading, setIsLoading] = useState(true);
	/* subscription on product changes:
	WayOfImplement 1: updating the ~products~ property of the  ~market~ variable
	WOI2: declare a new state ~products~ and update it

	For this feature, they don't differ. But in case future features would need to use ~market~ variable in other components, it's better for ~market~ to stay up to date. Therefore I'm choosing WOI1 here.
	*/
	// const [products, setProducts] = useState();

	useEffect(() => {
		fetchMarket();
	}, []);

	/* subscription to product create, update and delete */
	useEffect(() => {
		/* subscription to product create */
		const onCreateProductListener = API.graphql(
			graphqlOperation(onCreateProduct, {
				owner: user.attributes.sub,
				// owner: "test1",
			})
		).subscribe({
			next: (productData) => {
				const createdProduct = productData.value.data.onCreateProduct;
				/* 如何update ~market~? */
				/* ==> functional update */

				console.log(market);
				setMarket((prevMarket) => {
					const updatedMarket = { ...prevMarket };
					updatedMarket.products.items.push(createdProduct);
					return updatedMarket;
				});
			},
			error: (err) => {
				console.warn(err.error.errors[0].message);
				console.log(err);
			},
		});

		/*subscription to product update */
		const onUpdateProductListener = API.graphql(
			graphqlOperation(onUpdateProduct, {
				owner: user.attributes.sub,
				// owner: "test1",
			})
		).subscribe({
			next: (productData) => {
				const updatedProduct = productData.value.data.onUpdateProduct;
				setMarket((prevMarket) => {
					const updatedMarket = { ...prevMarket };
					updatedMarket.products.items = prevMarket.products.items.map(
						(product) => {
							if (product.id === updatedProduct.id) return updatedProduct;
							else return product;
						}
					);
					return updatedMarket;
				});
			},
			error: (err) => {
				console.warn(err.error.errors[0].message);
				console.log(err);
			},
		});

		/*subscription to product delete */
		const onDeleteProductListener = API.graphql(
			graphqlOperation(onDeleteProduct, {
				owner: user.attributes.sub,
				// owner: "test1",
			})
		).subscribe({
			next: (productData) => {
				const deletedProduct = productData.value.data.onDeleteProduct;
				setMarket((prevMarket) => {
					const updatedMarket = { ...prevMarket };
					updatedMarket.products.items = prevMarket.products.items.filter(
						(product) => product.id != deletedProduct.id
					);
					return updatedMarket;
				});
			},
			error: (err) => {
				console.warn(err.error.errors[0].message);
				console.log(err);
			},
		});

		return function cleanup() {
			onCreateProductListener.unsubscribe();
			onUpdateProductListener.unsubscribe();
		};
	}, [market]);

	/* QUESTION: 新创建一个product后，onMarketUpdate的subscription会不会返回数据呢？ */
	/* ==> ANSWER: 试验之后，onMarketUpdate没有对删除一个product做出反应，由此推测onMarketUpdate只对updateMarket有反应 */
	// useEffect(() => {
	// 	const onMarketUpdateListener = API.graphql(
	// 		graphqlOperation(onUpdateMarket)
	// 	).subscribe({
	// 		next: (data) => console.log(data),
	// 		error: (err) => console.log(err),
	// 	});

	// 	return function cleanup() {
	// 		onMarketUpdateListener.unsubscribe();
	// 	};
	// }, []);

	async function fetchMarket() {
		try {
			const fetchResult = await API.graphql(
				graphqlOperation(getMarket, {
					id: marketId,
				})
			);
			console.log(fetchResult);
			setMarket(fetchResult.data.getMarket);
			setIsLoading(false);
		} catch (err) {
			console.error(err);
		}
	}

	return isLoading ? (
		<Loading fullscreen></Loading>
	) : (
		<>
			<div className="back-nav-link">
				<Link to="/">
					<Button>
						<i className="el-icon-arrow-left" />
						<span>Back to Markets List</span>
					</Button>
				</Link>
			</div>
			<div className="market-name">
				<strong>{market.name}</strong> <span>{`By ${market.owner}`}</span>
			</div>
			<div>
				<i className="el-icon-date" /> <span>{market.createdAt}</span>
			</div>
			<Tabs
				className="market-page-tabs"
				type="border-card"
				value={market.owner === user.username ? "1" : "2"}
			>
				<Tabs.Pane
					disabled={user.username !== market.owner}
					label={
						<span>
							<Icon name="plus" />
							Add Product
						</span>
					}
					name="1"
					className="market-page-new-product"
				>
					<NewProduct marketId={marketId} />
				</Tabs.Pane>
				<Tabs.Pane
					className="market-page-prodcut-list"
					label={
						<span>
							<Icon name="menu" />
							{`Products (${market.products.items.length})`}
						</span>
					}
					name="2"
				>
					<div className="product-list">
						{market.products.items
							.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING)
							.map((product) => {
								return <Product key={product.id} product={product} />;
							})}
					</div>
				</Tabs.Pane>
			</Tabs>
		</>
	);
}
