import React, { useState, useContext, useEffect } from "react";
import {
	Button,
	Icon,
	Dialog,
	Form,
	Input,
	Notification,
	Select,
} from "element-react";
import { AiFillPlusCircle } from "react-icons/ai";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { UserContext } from "../App";

const TAGS = ["Food", "Clothing", "Eletronics", "Book", "Office"];

export default function NewMarket(props) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [marketName, setMarketName] = useState("");
	const user = useContext(UserContext);
	const [tagsSelected, setTagsSelected] = useState([]);

	function handleCloseDialog() {
		setIsDialogOpen(false);
	}

	/* graphql operation for creating market */
	async function handleCreateMarket(event) {
		event.preventDefault();
		console.log(user.user.username);
		const { username } = user.user;
		let mutationInput = {
			name: marketName,
			owner: username,
			tags: tagsSelected,
		};
		try {
			// debugger;
			const result = await API.graphql(
				{
					query: createMarket,
					variables: { input: mutationInput },
				}
				// graphqlOperation(createMarket, { input: mutationInput })
			);
			console.log(result);
			setMarketName("");
			setTagsSelected([]);
			setIsDialogOpen(false);
		} catch (err) {
			console.error(err);
			console.dir(err.message);
			Notification.error({
				title: "Error",
				message: "Error occurred trying to add market",
				duration: 3000,
			});
		}
	}

	function handleTagSelect(selectedTag) {
		setTagsSelected(selectedTag);
	}

	function handleSearchInputChange(input) {
		props.setSearchTerm(input);
	}

	return (
		<>
			<div className="market-header">
				<h1 className="market-title">Add Your Market</h1>
				<Button
					type="text"
					onClick={() => setIsDialogOpen(true)}
					className="market-add-button"
				>
					<AiFillPlusCircle size="3em" color="orange" />
				</Button>
			</div>

			<Form inline={true} className="market-search-bar">
				<Form.Item>
					<Input
						type="text"
						value={props.searchTerm}
						onChange={handleSearchInputChange}
						placeholder="search markets by name or tag"
					/>
				</Form.Item>
				<Form.Item>
					<Button
						nativeType="submit"
						type="primary"
						onClick={props.handleSearchSubmit}
						loading={props.isSearchLoading}
					>
						Search
					</Button>
				</Form.Item>
			</Form>

			<Dialog
				title="Add new market"
				visible={isDialogOpen}
				onCancel={handleCloseDialog}
				closeOnPressEscape={true}
				top="30%"
			>
				<Dialog.Body>
					<Form
						// onSubmit={(event) => {
						// 	event.preventDefault();
						// 	console.log("here");
						// }}
						onSubmit={handleCreateMarket}
					>
						<Form.Item label="New Market Name">
							<Input
								placeholder="Market Name"
								trim={true}
								onChange={(name) => setMarketName(name)}
								value={marketName}
							/>
						</Form.Item>
						<Form.Item label="Add tags">
							<Select
								value={tagsSelected}
								filterable={true}
								multiple={true}
								onChange={handleTagSelect}
							>
								{TAGS.map((tag) => (
									<Select.Option key={tag} value={tag} label={tag} />
								))}
							</Select>
						</Form.Item>
					</Form>
				</Dialog.Body>
				<Dialog.Footer>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button
						type="primary"
						disabled={!marketName}
						onClick={handleCreateMarket}
						// nativeType="submit"
					>
						Create
					</Button>
				</Dialog.Footer>
			</Dialog>
		</>
	);
}
