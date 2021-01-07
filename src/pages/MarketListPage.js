import React, { useEffect, useState } from "react";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";
import { API, graphqlOperation } from "aws-amplify";
import { Button, Notification } from "element-react";
import { COMPARE_NOTES_CREATEDTIME_ASCENDING } from "../utils";
import { onCreateMarket } from "../graphql/subscriptions";

/* the query provided by codegen does not query products item */
const listMarkets = /* GraphQL */ `
	query ListMarkets(
		$filter: ModelMarketFilterInput
		$limit: Int
		$nextToken: String
	) {
		listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
			items {
				id
				name
				tags
				owner
				createdAt
				products {
					items {
						name
					}
				}
				updatedAt
			}
			nextToken
		}
	}
`;

/* the query provided by codegen does not query products item */
const searchMarkets = /* GraphQL */ `
	query SearchMarkets(
		$filter: SearchableMarketFilterInput
		$sort: SearchableMarketSortInput
		$limit: Int
		$nextToken: String
	) {
		searchMarkets(
			filter: $filter
			sort: $sort
			limit: $limit
			nextToken: $nextToken
		) {
			items {
				id
				name
				tags
				owner
				createdAt
				products {
					items {
						name
					}
				}
				updatedAt
			}
			nextToken
			total
		}
	}
`;

export default function MarketListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [searchResultList, setSearchResultList] = useState([]);
	const [currentSearchTerm, setCurrentSearchTerm] = useState("");
	const [shouldShowAllMarkets, setShouldShowAllMarkets] = useState(true);
	/* new state */
	const [allMarketList, setAllMarketList] = useState();

	/* Effect Hook */
	useEffect(() => {
		fetchAllMarkets();
	}, []);

	/* graphql subscription for onCreateMarket */
	useEffect(() => {
		try {
			const createMarketSubscription = API.graphql(
				graphqlOperation(onCreateMarket)
			).subscribe({
				next: (marketData) => {
					const newMarket = marketData.value.data.onCreateMarket;
					setAllMarketList((prevMarkets) => {
						return [...prevMarkets, newMarket].sort(
							COMPARE_NOTES_CREATEDTIME_ASCENDING
						);
					});
					Notification.success({
						title: "Success!",
						message: "Added new market",
					});
				},
			});

			return function cleanup() {
				createMarketSubscription.unsubscribe();
			};
		} catch (err) {
			console.error(`Error subscribing to onCreateMarket`, err);
		}
	}, []);

	/* graphql operation for getting list of markets for the current user */
	async function fetchAllMarkets() {
		try {
			const result = await API.graphql({ query: listMarkets });
			console.log(result);
			setAllMarketList(
				result.data.listMarkets.items.sort(COMPARE_NOTES_CREATEDTIME_ASCENDING)
			);
		} catch (err) {
			console.log(err);
		}
	}

	/* graphql operation for searching market by name or tags */
	async function handleSearchSubmit(event) {
		event.preventDefault();
		setIsSearchLoading(true);
		try {
			const searchResult = await API.graphql(
				graphqlOperation(searchMarkets, {
					filter: {
						or: [
							{ name: { wildcard: `*${searchTerm}*` } },
							{ tags: { wildcard: `*${searchTerm}*` } },
						],
					},
				})
			);
			console.log(searchResult.data.searchMarkets.items);
			setSearchResultList(
				searchResult.data.searchMarkets.items.sort(
					COMPARE_NOTES_CREATEDTIME_ASCENDING
				)
			);
			setCurrentSearchTerm(searchTerm);
			setSearchTerm("");
			setShouldShowAllMarkets(false);
			setIsSearchLoading(false);
		} catch (error) {
			console.log(error);
		}
	}

	function showAllMarkets() {
		setShouldShowAllMarkets(true);
		setSearchResultList([]);
		setCurrentSearchTerm("");
	}

	return (
		<div>
			<NewMarket
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				handleSearchSubmit={handleSearchSubmit}
				isSearchLoading={isSearchLoading}
			/>
			{allMarketList &&
				allMarketList.map((market) => console.log(market.id, market.name))}
			{shouldShowAllMarkets ? (
				<MarketList markets={allMarketList} />
			) : (
				<div>
					<h2 className="search-result-hint">
						<Button icon="arrow-left" onClick={showAllMarkets} />
						<span className="search-result-text">
							{`showing search results for "${currentSearchTerm}": ${searchResultList.length} matching`}
						</span>
					</h2>
					<MarketList markets={searchResultList} />
				</div>
			)}

			{/* <MarketList
				searchResultList={searchResultList}
				currentSearchTerm={currentSearchTerm}
				shouldShowAllMarkets={shouldShowAllMarkets}
				showAllMarkets={showAllMarkets}
			/> */}
		</div>
	);
}
