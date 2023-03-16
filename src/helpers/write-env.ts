import * as fs from "fs";
import { PluginInstance } from "../PluginInstance";

export async function writeEnv(minioInstance: PluginInstance) {
	const path = `${minioInstance.getInstallationPath()}/.env`;
	let env = "";
	const keys: any = await minioInstance.getContainerController().getEnv();
	Object.keys(keys).forEach((key) => {
		env += `${key}="${keys[key]}"
`;
	});

	fs.writeFileSync(path, env);
}