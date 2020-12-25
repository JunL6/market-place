import React, { useState, useEffect } from "react";
import {
	// withAuthenticator,
	AmplifyGreetings,
	AmplifyAuthenticator,
} from "@aws-amplify/ui-react";
import { Authenticator, Greetings } from "aws-amplify-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { BrowserRouter, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
import { API, Auth, graphqlOperation, Hub } from "aws-amplify";
/* try: worked. CSS for components in "aws-amplify-react" */
import "@aws-amplify/ui/dist/style.css";
import { registerUser } from "./graphql/mutations";
import { getUser } from "./graphql/queries";

export const UserContext = React.createContext();

function App() {
	const [authState, setAuthState] = useState();
	const [user, setUser] = useState();

	useEffect(() => {
		onAuthUIStateChange((nextAuthState, authData) => {
			setAuthState(nextAuthState);
			setUser(authData);
		});

		/* Auth event listener (https://docs.amplify.aws/lib/auth/auth-events/q/platform/js)
			feat: when the user signs in, check if the user email has registered for 'User' table. If not: register. 
		*/
		Hub.listen("auth", (data) => {
			// console.log(data);
			console.log(data);
			switch (data.payload.event) {
				case "signIn":
					registerNewUser(
						data.payload.data.attributes.sub,
						data.payload.data.attributes.email,
						data.payload.data.username
					);
					break;
			}
		});
	}, []);

	async function registerNewUser(userId, email, username) {
		try {
			// debugge r;
			const getUserData = await API.graphql(
				graphqlOperation(getUser, {
					id: userId,
				})
			);

			console.log(getUserData);

			if (!getUserData.data.getUser) {
				const result = await API.graphql(
					graphqlOperation(registerUser, {
						input: {
							id: userId,
							email,
							username,
						},
					})
				);

				console.log(result.data);
			} else console.log(`${username} has already registered.`);
		} catch (err) {
			console.log(err);
		}
	}

	async function handleSignOut() {
		try {
			await Auth.signOut();
		} catch (err) {
			console.error(err);
		}
	}

	return authState === AuthState.SignedIn && user ? (
		<UserContext.Provider value={{ user }}>
			<BrowserRouter>
				<Navbar user={user} handleSignOut={handleSignOut} />
				<div className="app-container">
					<Route exact path="/" component={HomePage} />
					<Route path="/profile" component={ProfilePage} />
					<Route
						path="/markets/:marketId"
						component={({ match }) => (
							<MarketPage marketId={match.params.marketId} user={user} />
						)}
					/>
				</div>
			</BrowserRouter>
		</UserContext.Provider>
	) : (
		<AmplifyAuthenticator />
		// <Authenticator />
	);
}

// export default withAuthenticator(App);
export default App;
