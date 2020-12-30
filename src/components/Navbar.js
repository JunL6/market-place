import React from "react";
import { Menu, Icon, Button } from "element-react";
import { NavLink } from "react-router-dom";
import { FaSellsy } from "react-icons/fa";
import { MdSettings } from "react-icons/md";

export default function Navbar({ user, handleSignOut }) {
	return (
		<Menu mode="horizontal" theme="dark" defaultActive="1">
			<div className="nav-container">
				<Menu.Item index="1">
					<NavLink to="/" className="nav-link">
						<FaSellsy color="orange" size="2em" />
						<span className="app-name">Market Place</span>
					</NavLink>
				</Menu.Item>
				<div className="nav-items">
					<Menu.SubMenu
						index="2"
						title={user.username}
						className="nav-sub-menu"
					>
						<Menu.Item index="2-1">
							{/* <Button type="warning" onClick={handleSignOut}> */}
							<span onClick={handleSignOut}>Sign Out</span>
						</Menu.Item>
					</Menu.SubMenu>
					<span className="greeting"> </span>
					<Menu.Item index="3">
						<NavLink to="/profile" className="nav-link">
							<MdSettings size="1.4em" />
							Profile
						</NavLink>
					</Menu.Item>
				</div>
			</div>
		</Menu>
	);
}
