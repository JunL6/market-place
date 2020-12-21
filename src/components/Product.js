import { S3Image } from "aws-amplify-react";
import {
	Button,
	Card,
	Dialog,
	Form,
	Input,
	Radio,
	Notification,
	MessageBox,
} from "element-react";
import React, { useContext, useState } from "react";
import PayButton from "./PayButton";
import { UserContext } from "../App";
import { convertCentsToDollars, convertDollarsToCents } from "../utils";
import { API, graphqlOperation } from "aws-amplify";
import { deleteProduct, updateProduct } from "../graphql/mutations";

export default function Product({ product }) {
	const user = useContext(UserContext);
	const [isOwner, setIsOwner] = useState(
		product.owner === user.user.attributes.sub
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [description, setDescription] = useState(product.description);
	const [price, setPrice] = useState(convertCentsToDollars(product.price));
	const [isShipped, setIsShipped] = useState(product.shipped);
	const [isUpdating, setIsUpdating] = useState(false);

	function handleDescriptionChange(value) {
		setDescription(value);
	}

	function handlePriceChange(value) {
		setPrice(value);
	}

	function handleRadioChange(value) {
		setIsShipped(Boolean(value === "Shipped"));
	}

	async function handleFormSubmit(event) {
		event.preventDefault();
		setIsUpdating(true);
		try {
			const updateResult = await API.graphql(
				graphqlOperation(updateProduct, {
					input: {
						id: product.id,
						description: description,
						price: convertDollarsToCents(price),
						shipped: isShipped,
					},
				})
			);
			console.log(updateResult);
			Notification.success({
				title: "Success",
				message: "Updated Product!",
			});
			setIsDialogOpen(false);
			setIsUpdating(false);
		} catch (err) {
			console.error(err);
			Notification.error({
				title: "Error",
				message: "Failed to Update Product",
			});
		}
	}

	function closeDialog() {
		setIsDialogOpen(false);
	}

	function handleDelete() {
		MessageBox.confirm(
			"This will permanently delete the product. Continue?",
			"Confirm",
			{
				confirmButtonText: "Delete",
				confirmButtonClass: "danger",
				cancelButtonText: "Cancel",
				type: "warning",
			}
		)
			.then(() => {
				deleteProductOperation();
			})
			.catch((err) => {
				console.log(err);
			});
	}

	async function deleteProductOperation() {
		try {
			// debugger;
			const deleteResult = await API.graphql(
				graphqlOperation(deleteProduct, {
					input: {
						id: product.id,
					},
				})
			);
			console.log(deleteResult);
			Notification.success({
				title: "Success",
				message: "Deleted Product",
			});
		} catch (err) {
			console.log(err);
			Notification.error({
				title: "Error",
				message: "Failed to Delete Product",
			});
		}
	}

	return (
		<div className="product-card">
			<Card
				bodyStyle={{
					padding: 0,
					//  width: "20em"
					display: "flex",
					flexDirection: "column",
				}}
			>
				<S3Image
					imgKey={product.file.key}
					theme={{
						photoImg: {
							// maxWidth: "100%",
							// maxHeight: "100%",
							width: "15em",
							height: "20em",
							objectFit: "cover",
						},
					}}
				/>
				<strong>{product.description}</strong>
				<div className="shipped">
					<i className="el-icon-message" />
					{product.shipped ? "Shipped" : "Emailed"}
				</div>
				<div className="price">${convertCentsToDollars(product.price)}</div>
				{isOwner ? (
					<div className="owner-buttons">
						<Button
							type="info"
							icon="edit"
							onClick={() => setIsDialogOpen(true)}
						/>
						<Button type="danger" icon="delete" onClick={handleDelete} />
					</div>
				) : (
					<div className="pay-button">
						<PayButton />
					</div>
				)}
			</Card>

			{/* dialog */}
			<Dialog
				title="Edit Product"
				visible={isDialogOpen}
				onCancel={closeDialog}
			>
				<Dialog.Body>
					<Form onSubmit={handleFormSubmit}>
						<Form.Item label="Update Product Description">
							<Input
								value={description}
								type="textarea"
								onChange={handleDescriptionChange}
								placeholder="description"
							/>
						</Form.Item>
						<Form.Item label="Update Product Price">
							<Input
								type="number"
								placeholder="Price ($USD)"
								value={price}
								onChange={handlePriceChange}
							/>
						</Form.Item>
						<Form.Item label="Is the Product Shipped or Emailed to the Customer?">
							{/* <Radio.Group onChange> */}
							<Radio
								checked={isShipped === true}
								value="Shipped"
								onChange={handleRadioChange}
							>
								Shipped
							</Radio>
							<Radio
								checked={isShipped === false}
								value="Emailed"
								onChange={handleRadioChange}
							>
								Emailed
							</Radio>
							{/* </Radio.Group> */}
						</Form.Item>

						<Form.Item className="dialog-buttons">
							<Button
								nativeType="submit"
								type="primary"
								disabled={
									!description ||
									!price ||
									isShipped === undefined ||
									isUpdating
								}
								onClick={handleFormSubmit}
								loading={isUpdating}
							>
								Update
							</Button>
							<Button onClick={closeDialog}>Cancel</Button>
						</Form.Item>
					</Form>
				</Dialog.Body>
			</Dialog>
		</div>
	);
}
