import { Form, Input, Button } from "element-react";
import React from "react";

export default function ProductSearchInput(props) {
	function handleSearchInputChange(input) {
		props.setSearchTerm(input);
	}

	return (
		<div>
			<Form inline={true} className="market-search-bar">
				<Form.Item>
					<Input
						type="text"
						value={props.searchTerm}
						onChange={handleSearchInputChange}
						placeholder="search products by name"
					/>
				</Form.Item>
				<Form.Item>
					<Button
						nativeType="submit"
						type="primary"
						onClick={props.handleSearchSubmit}
						loading={props.isSearchLoading}
						disabled={props.searchTerm === ""}
					>
						Search
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
