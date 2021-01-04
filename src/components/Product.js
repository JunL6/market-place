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
	const [productName, setProductName] = useState(product.name);
	const [description, setDescription] = useState(product.description);
	const [price, setPrice] = useState(convertCentsToDollars(product.price));
	const [isShipped, setIsShipped] = useState(product.shipped);
	const [isUpdating, setIsUpdating] = useState(false);
	const [shouldShowProductDetail, setShouldShowProductDetail] = useState(false);

	function handleProductNameChange(value) {
		setProductName(value);
	}

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
						name: productName,
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

	function showProductDetail() {
		setShouldShowProductDetail(true);
	}

	function hideProductDetail() {
		// debugger;
		setShouldShowProductDetail(false);
	}

	return (
		<>
			<div className="product-card">
				<Card
					bodyStyle={{
						padding: 0,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<S3Image
						onClick={showProductDetail}
						imgKey={product.file.key}
						theme={{
							photoImg: {
								width: "15em",
								height: "20em",
								objectFit: "cover",
							},
						}}
					/>
					<div className="product-card-content" onClick={showProductDetail}>
						<strong>{product.name}</strong>
						{/* <div className="description">{product.description}</div> */}
						<div className="shipped">
							<i className="el-icon-message" />
							{product.shipped ? "Deliver" : "Email"}
							<div className="price">
								${convertCentsToDollars(product.price)}
							</div>
						</div>
					</div>
				</Card>
			</div>

			{/* dialog to see product detail */}
			<Dialog
				top="5%"
				size="large"
				visible={shouldShowProductDetail}
				onCancel={hideProductDetail}
				lockScroll={false}
				customClass="product-detail-dialog"
			>
				<Dialog.Body className="product-detail-dialog-body">
					<div className="image-wrapper">
						<S3Image
							imgKey={product.file.key}
							theme={{
								photoImg: {
									// width: "100%",
									// flexGrow: 1,
									maxHeight: "40em",
									width: "100%",
									// maxWidth: "50%",
									objectFit: "contain",
								},
							}}
						/>
					</div>
					<div className="product-detail-content">
						<span className="product-name">{product.name}</span>
						<div className="product-detail-seond-line">
							<span className="product-price">{`$${convertCentsToDollars(
								product.price
							)}`}</span>
							<div className="shipped">
								<i className="el-icon-message" />
								Ship via:
								{product.shipped ? "Deliver" : "Email"}
							</div>
						</div>
						<span className="product-description">{product.description}</span>
					</div>
				</Dialog.Body>
				<Dialog.Footer>
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
							<PayButton product={product} user={user} />
						</div>
					)}
				</Dialog.Footer>
			</Dialog>
			{/* dialog to edit product */}
			<Dialog
				title="Edit Product"
				visible={isDialogOpen}
				onCancel={closeDialog}
			>
				<Dialog.Body>
					<Form onSubmit={handleFormSubmit}>
						<Form.Item label="Product Name">
							<Input
								value={productName}
								type="text"
								placeholder="product name"
								onChange={handleProductNameChange}
							/>
						</Form.Item>
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
		</>
	);
}
