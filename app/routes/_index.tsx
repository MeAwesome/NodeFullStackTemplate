export function meta() {
	return [{ title: "Home" }];
}

export default function Index() {
	return (
		<div className="flex flex-col items-center justify-center w-full h-screen">
			<h1>Welcome to the Node FullStack Template</h1>
			<p>This is a basic template for building fullstack applications with Node.js.</p>
		</div>
	);
}
