import React, { useState } from "react";
import MarketList from "../components/MarketList";
import NewMarket from "../components/NewMarket";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../graphql/queries";

export default function MarketListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearchLoading, setIsSearchLoading] = useState(false);
	const [searchResultList, setSearchResultList] = useState([]);
	const [currentSearchTerm, setCurrentSearchTerm] = useState("");
	const [shouldShowAllMarkets, setShouldShowAllMarkets] = useState(true);

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
			setSearchResultList(searchResult.data.searchMarkets.items);
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
	}

	return (
		<div>
			<NewMarket
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				handleSearchSubmit={handleSearchSubmit}
				isSearchLoading={isSearchLoading}
			/>
			<MarketList
				searchResultList={searchResultList}
				currentSearchTerm={currentSearchTerm}
				shouldShowAllMarkets={shouldShowAllMarkets}
				showAllMarkets={showAllMarkets}
			/>
		</div>
	);
}
