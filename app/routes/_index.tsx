import { useState } from "react";
import { Button } from "~/components/shadcn/ui/button";
import { useSocket } from "~/hooks/use-socket";

export function meta() {
	return [{ title: "Home" }];
}

export default function Index() {
	const [count, setCount] = useState(0);
	const socket = useSocket();
	socket.on("heartbeat", () => {
		setCount((prevCount) => prevCount + 1);
	});
	return (
		<div className="flex flex-col items-center justify-center text-center w-full h-screen">
			<h1>Welcome to the Node FullStack Template</h1>
			<p>This is a basic template for building fullstack applications with Node.js.</p>
			<p className="text-2xl font-bold">{count}</p>
			<p className="text-2xl font-bold">{socket.latency}ms</p>
			<div className="flex flex-row gap-4">
				<Button className="mb-4" onClick={() => socket.emit("click/start")}>
					Start Heartbeat
				</Button>
				<Button onClick={() => socket.emit("click/stop")}>Stop Heartbeat</Button>
			</div>
		</div>
	);
}
