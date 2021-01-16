MarketPlace app with React and AWS Amplify.

Deployed on AWS cloudfront: https://d24t6aoqzf5gkl.cloudfront.net/
(If you don't want to sign up for an account, here is an account for testing: 
  username: **test1**
  password: **testtest**)
  
---
### Features:
:Authentication with AWS Amplify
:Create market with tags
:Add, edit, delete products to market
:view all the markets and products
:search for markets and products by name or tag
:purchase product with Stripe (Stripe test feature), and get email notification(AWS SES did not approve my project, so it's only available for verified emails for now)
:view orders

---
### Tech used:

(front-end)
- React
- GraghQL
- Element UI as CSS framework
- Stripe for payment testing

(back-end)
- Node.js for lambda function (serverless function for processing Stripe payment)
- S3 for image storage
