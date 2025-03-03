import TimingsService from "@/core/services/TimingsService";

export default async function stop() {
	console.log("Stop Button Clicked");
	TimingsService.clearTiming("heartbeat");
}
