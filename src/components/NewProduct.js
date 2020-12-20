// import { AmplifyPhotoPicker } from "@aws-amplify/ui-react";
import { PhotoPicker } from "aws-amplify-react";
import {
	Button,
	Form,
	Input,
	Notification,
	Radio,
	Progress,
} from "element-react";
import React, { useRef, useState } from "react";
import { API, Auth, graphqlOperation, Storage } from "aws-amplify";
import { createProduct } from "../graphql/mutations";
import awsExports from "../aws-exports";
import { convertDollarsToCents } from "../utils";

export default function NewProduct({ marketId }) {
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState();
	const [isShipped, setIsShipped] = useState();
	const [imageFile, setImageFile] = useState();
	const [isUploading, setIsUploading] = useState(false);
	const photoPicker = useRef(null);
	const [uploadProgress, setUploadProgress] = useState();
	// todo: progress bar

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
		setIsUploading(true);

		try {
			/* 给image file命名 */
			// const visibility = "public";
			const { identityId } = await Auth.currentCredentials();
			// const fileName = `/${visibility}/${identityId}/${Date.now()}-${
			// 	imageFile.name
			// }`;
			const fileName = `${identityId}/${Date.now()}-${imageFile.name}`;
			/* upload image file to S3 */
			// console.log(imageFile);
			const uploadedFile = await Storage.put(fileName, imageFile, {
				contentType: imageFile.type,
			});
			// console.log(uploadedFile);
			/* S3 object */
			const S3Object = {
				key: uploadedFile.key,
				region: awsExports.aws_user_files_s3_bucket_region,
				bucket: awsExports.aws_user_files_s3_bucket,
			};
			/* graphql: createProduct */
			const newProduct = await API.graphql(
				graphqlOperation(createProduct, {
					input: {
						description: description,
						file: S3Object,
						price: convertDollarsToCents(price),
						marketID: marketId,
						shipped: isShipped,
					},
				})
			);
			// console.log(newProduct);
			Notification.success({
				title: "Success!",
				message: "Added New Product",
			});
		} catch (error) {
			console.error(error);
		} finally {
			/* try: 看看视觉上，button的loading状态的取消是不是和notification的出现是同时的 */
			setDescription("");
			setPrice();
			setIsShipped();
			setImageFile();
			photoPicker.current.state.previewSrc = undefined;
			setIsUploading(false);
		}
	}

	function handleImagePick(image) {
		// console.log(image);
		setImageFile(image.file);
	}

	return (
		<div className="new-product-form">
			<h3>ADD NEW PRODUCT</h3>
			<Form onSubmit={handleFormSubmit}>
				<Form.Item label="Add Product Description">
					<Input
						value={description}
						type="textarea"
						onChange={handleDescriptionChange}
						placeholder="description"
					/>
				</Form.Item>
				<Form.Item label="Set Product Price">
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
				<Form.Item label="Upload Product Image">
					<PhotoPicker
						ref={photoPicker}
						theme={{
							sectionHeader: {
								display: "none",
							},
							formContainer: {
								margin: "0",
								padding: "0.2em",
							},
						}}
						preview="show"
						// onLoad={(param) => console.log(param)}
						onPick={handleImagePick}
						// onPick={(file) => console.log(file)}
					/>
				</Form.Item>
				<Form.Item>
					{/* {console.log(description, price, isShipped, imageFile, isShipped)} */}
					<Button
						nativeType="submit"
						type="primary"
						disabled={
							!description ||
							!price ||
							isShipped === undefined ||
							!imageFile ||
							isUploading
						}
						onClick={handleFormSubmit}
						loading={isUploading}
					>
						Add Product
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
