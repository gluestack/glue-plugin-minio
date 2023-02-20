import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";
import { IMinio } from "./interfaces/IMinio";
export declare class PluginInstanceContainerController implements IContainerController, IMinio {
    app: IApp;
    status: "up" | "down";
    portNumber: number;
    consolePortNumber: number;
    containerId: string;
    dockerfile: string;
    callerInstance: IInstance;
    publicBucketName: string;
    privateBucketName: string;
    constructor(app: IApp, callerInstance: IInstance);
    getPublicBucketName(): string;
    getPrivateBucketName(): string;
    getCallerInstance(): IInstance;
    getAdminEndPoint(): string;
    getCdnEndPoint(): string;
    getEnv(): Promise<{
        MINIO_ADMIN_END_POINT: string;
        MINIO_CDN_END_POINT: string;
        MINIO_PORT: number;
        MINIO_USE_SSL: boolean;
        MINIO_ACCESS_KEY: string;
        MINIO_SECRET_KEY: string;
        MINIO_PUBLIC_BUCKET: string;
        MINIO_PRIVATE_BUCKET: string;
    }>;
    getDockerJson(): Promise<{
        Image: string;
        HostConfig: {
            PortBindings: {
                "9000/tcp": {
                    HostPort: string;
                }[];
                "9001/tcp": {
                    HostPort: string;
                }[];
            };
            Binds: string[];
        };
        ExposedPorts: {
            "9000/tcp": {};
            "9001/tcp": {};
        };
        Cmd: string[];
    }>;
    getStatus(): "up" | "down";
    getPortNumber(returnDefault?: boolean): Promise<unknown>;
    getConsolePortNumber(returnDefault?: boolean): Promise<unknown>;
    getContainerId(): string;
    setStatus(status: "up" | "down"): "up" | "down";
    setPortNumber(portNumber: number): number;
    setConsolePortNumber(consolePortNumber: number): number;
    setContainerId(containerId: string): string;
    setDockerfile(dockerfile: string): string;
    getConfig(): any;
    up(): Promise<void>;
    down(): Promise<void>;
    build(): Promise<void>;
}
