import React, { useState, useEffect } from "react";
import {
	// withAuthenticator,
	AmplifyGreetings,
	AmplifyAuthenticator,
} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { BrowserRouter, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
import { Auth } from "aws-amplify";

function App() {
	const [authState, setAuthState] = useState();
	const [user, setUser] = useState();

	useEffect(() => {
		onAuthUIStateChange((nextAuthState, authData) => {
			setAuthState(nextAuthState);
			setUser(authData);
		});
	}, []);

	async function handleSignOut() {
		try {
			await Auth.signOut();
		} catch (err) {
			console.error(err);
		}
	}

	return authState === AuthState.SignedIn && user ? (
		<BrowserRouter>
			<Navbar user={user} handleSignOut={handleSignOut} />
			<div className="app-container">
				<Route exact path="/" component={HomePage} />
				<Route path="/profile" component={ProfilePage} />
				<Route
					path="/markets/:marketId"
					component={({ match }) => (
						<MarketPage marketId={match.params.marketId} />
					)}
				/>
			</div>
		</BrowserRouter>
	) : (
		<AmplifyAuthenticator />
	);
}

// export default withAuthenticator(App);
export default App;
