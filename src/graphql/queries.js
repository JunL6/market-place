/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMarket = /* GraphQL */ `
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
				}
				nextToken
			}
			updatedAt
		}
	}
`;
export const listMarkets = /* GraphQL */ `
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
					nextToken
				}
				updatedAt
			}
			nextToken
		}
	}
`;
export const getProduct = /* GraphQL */ `
	query GetProduct($id: ID!) {
		getProduct(id: $id) {
			id
			description
			file {
				bucket
				region
				key
			}
			price
			shipped
			owner
			createdAt
			marketID
			market {
				id
				name
				tags
				owner
				createdAt
				products {
					nextToken
				}
				updatedAt
			}
			updatedAt
		}
	}
`;
export const listProducts = /* GraphQL */ `
	query ListProducts(
		$filter: ModelProductFilterInput
		$limit: Int
		$nextToken: String
	) {
		listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
			items {
				id
				description
				file {
					bucket
					region
					key
				}
				price
				shipped
				owner
				createdAt
				marketID
				market {
					id
					name
					tags
					owner
					createdAt
					updatedAt
				}
				updatedAt
			}
			nextToken
		}
	}
`;
export const getUser = /* GraphQL */ `
	query GetUser($id: ID!) {
		getUser(id: $id) {
			id
			username
			email
			registered
			orders {
				items {
					id
					userID
					createdAt
					updatedAt
				}
				nextToken
			}
			createdAt
			updatedAt
		}
	}
`;
export const searchMarkets = /* GraphQL */ `
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
					nextToken
				}
				updatedAt
			}
			nextToken
			total
		}
	}
`;

const getUserQuery = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      email
    username
    orders {
      items {
        createdAt
        product {
          owner
          price
          shipped
          market {
            name
          }
          file {
            key
          }
        }
        shippingAddress {
          address_line1
          address_state
          address_zip
          city
          country
        }
      }
    }
  }
`;
