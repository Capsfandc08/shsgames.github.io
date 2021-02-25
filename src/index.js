import React, { useEffect } from "react";
import { render } from "react-dom";
import { BrowserRouter, HashRouter, Route } from "react-router-dom";
import * as OfflinePluginRuntime from "offline-plugin/runtime";
import "./styles/main.less";
import "script-loader!jquery";
import "photoncss";
import "./app";

// Get right router type for app
const Router = location.protocol === "file:" ? HashRouter : BrowserRouter;

// Import all views
const views = [];
const importAll = a => a.keys().forEach(k => views.push(a(k)));
importAll(require.context("./views", true, /\.js$/));

// Root component
function Root() {

	useEffect(function() {
		let route = app.getRoute();
		(function loop() {
			requestAnimationFrame(loop);
			if(route !== app.getRoute()) {
				route = app.getRoute();
				$(window).scrollTop(0);
				Photon.reload();
			}
		}());
	});

	return (
		<Router>
			<main>
				{ views.map(({ route, View, default: def }, key) => <Route key={key} path={route} exact={true} component={def || View}/> ) }
			</main>
		</Router>
  	);

}

// Wait for the DOM to load before rendering
document.addEventListener("DOMContentLoaded", function() {

	// Append a container to the DOM to render content into
	const root = document.createElement("DIV");
	root.id = "root";
	document.body.append(root);

	// Render root component into react-root container
	render(<Root/>, document.getElementById("root"));

});

// If is running in production
if(PRODUCTION) {

	// Register a static asset caching service-worker
	OfflinePluginRuntime.install();

	// Get client version
	const client = require("raw-loader!../hash").default;

	// Get server version
	fetch(`/hash`).then(resp => resp.text()).then(async server => {

		console.log({client, server})

		// Make sure client recieved a hash
		if(server.match(/([0-9]|[a-f]|[A-F]){8}-([0-9]|[a-f]|[A-F]){4}-([0-9]|[a-f]|[A-F]){4}-([0-9]|[a-f]|[A-F]){4}-([0-9]|[a-f]|[A-F]){12}/gmi)) {

			// Update the client
			if(server !== client) app.update(server);

		}

	})

}
