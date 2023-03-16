import { PluginInstance } from "../PluginInstance";
export declare const defaultConfig: {
    external: boolean;
    username: string;
    password: string;
    admin_end_point: string;
    cdn_end_point: string;
    port: string;
};
export declare const writeInstance: (pluginInstance: PluginInstance) => Promise<void>;
