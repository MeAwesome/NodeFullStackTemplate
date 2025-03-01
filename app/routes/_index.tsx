import { useSocket } from "~/hooks/useSocket";
import { Button } from "~/components/shadcn/ui/button";

export function meta() {
	return [{ title: "bingus" }];
}

export default function Index() {
	const { emit } = useSocket();
	const handleClick = () => {
		emit("test", "Hello from the client!");
	}
	return (
		<div className="flex flex-col items-center justify-center w-full h-screen">
			<h1>Welcome to the Node FullStack Template</h1>
			<p>This is a basic template for building fullstack applications with Node.js.</p>
			<Button onClick={handleClick} className="mt-4">
				Click me
			</Button>
		</div>
	);
}
