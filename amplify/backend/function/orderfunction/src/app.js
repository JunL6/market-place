/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
require("dotenv").config();
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var AWS = require("aws-sdk");

// aws-sdk config
const aws_config = {
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY,
	region: "us-east-1",
	adminEmail: "l.jun1717@gmail.com",
};

var ses = new AWS.SES(aws_config);

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

/****************************
 * Example post method *
 ****************************/

const chargeHandler = async (req, res, next) => {
	// Add your code here
	// res.json({ success: "post call succeed!", url: req.url, body: req.body });
	const { token } = req.body;
	const {
		currency,
		amount,
		description,
		productOwnerEmail,
		shipped,
		customerEmail,
	} = req.body.charge;

	try {
		const charge = await stripe.charges.create({
			source: token.id,
			amount,
			currency,
			description,
		});
		// res.json(charge);
		if (charge.status === "succeeded") {
			req.charge = charge;
			req.description = description;
			req.productOwnerEmail = productOwnerEmail;
			req.shipped = shipped;
			req.customerEmail = customerEmail;
			console.log("charge successful");
			next();
		}
	} catch (err) {
		res
			.status(500)
			.json({ error: err, message: "failed to process stripe payment" });
	}
};

function convertCentsToDollars(price) {
	return (Number.parseFloat(price) / 100).toFixed(2);
}

const emailHandler = (req, res) => {
	const {
		charge,
		description,
		productOwnerEmail,
		shipped,
		customerEmail,
	} = req;
	// const { charge, description } = req.body;

	ses.sendEmail(
		{
			Source: aws_config.adminEmail,
			ReturnPath: aws_config.adminEmail,
			Destination: {
				ToAddresses: [aws_config.adminEmail],
			},
			Message: {
				Subject: {
					Data: "Order Details - CAMarketPlace",
				},
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: `<h3>Order Processed!</h3>
						<p><span style="font-weight: bold">${description}</span> - $${convertCentsToDollars(
							charge.amount
						)}</p>
						<p>Customer Email: <a href="mailto:${customerEmail}">${customerEmail}</a></p>
						<p>Contact Your Seller: <a href="mailto:${productOwnerEmail}">${productOwnerEmail}</a></p>  
						${
							shipped
								? `<h4>Mailing Address</h4>
							<div>${charge.source.name}</div>
							<div>${charge.source.address_line1}</div>
							<div>${charge.source.address_city}, ${charge.source.address_state} ${charge.source.address_zip}</div>
							
							`
								: `<p>Product will be emailed.</p>`
						}
						`,
					},
				},
			},
		},
		(err, data) => {
			if (err) {
				return res.status(500).json({ error: err });
			}
			res.json({
				message: "Order Processed Successfully!",
				charge,
				data,
			});
		}
	);
};

app.post("/charge", chargeHandler, emailHandler);

app.listen(3000, function () {
	console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
