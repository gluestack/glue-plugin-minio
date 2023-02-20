const { DockerodeHelper } = require("@gluestack/helpers");
import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";
import { IMinio } from "./interfaces/IMinio";
import { constructEnv } from "./helpers/constructEnv";
import { createBucket } from "./helpers/createBucket";
import { defaultConfig } from "./commands/minioConfig";

export class PluginInstanceContainerController
  implements IContainerController, IMinio {
  app: IApp;
  status: "up" | "down" = "down";
  portNumber: number;
  consolePortNumber: number;
  containerId: string;
  dockerfile: string;
  callerInstance: IInstance;
  publicBucketName: string = "public";
  privateBucketName: string = "private";

  constructor(app: IApp, callerInstance: IInstance) {
    this.app = app;
    this.callerInstance = callerInstance;
    this.setStatus(this.callerInstance.gluePluginStore.get("status"));
    this.setPortNumber(this.callerInstance.gluePluginStore.get("port_number"));
    this.setConsolePortNumber(
      this.callerInstance.gluePluginStore.get("console_port_number"),
    );
    this.setContainerId(
      this.callerInstance.gluePluginStore.get("container_id"),
    );
  }

  getPublicBucketName(): string {
    return this.publicBucketName;
  }

  getPrivateBucketName(): string {
    return this.privateBucketName;
  }

  getCallerInstance(): IInstance {
    return this.callerInstance;
  }

  getAdminEndPoint(): string {
    return "host.docker.internal"
  }

  getCdnEndPoint(): string {
    return "127.0.0.1"
  }

  async getEnv() {
    let minio_credentials = defaultConfig;

    if (
      !this.callerInstance.gluePluginStore.get("minio_credentials") ||
      !this.callerInstance.gluePluginStore.get("minio_credentials").username
    )
      this.callerInstance.gluePluginStore.set(
        "minio_credentials",
        minio_credentials,
      );

    minio_credentials =
      this.callerInstance.gluePluginStore.get("minio_credentials");

    return {
      MINIO_ADMIN_END_POINT: minio_credentials.admin_end_point,
      MINIO_CDN_END_POINT: minio_credentials.cdn_end_point,
      MINIO_PORT: parseInt(minio_credentials.port),
      MINIO_USE_SSL: false,
      MINIO_ACCESS_KEY: minio_credentials.username,
      MINIO_SECRET_KEY: minio_credentials.password,
      MINIO_PUBLIC_BUCKET: this.getPublicBucketName(),
      MINIO_PRIVATE_BUCKET: this.getPrivateBucketName(),
    };
  }

  async getDockerJson() {
    return {
      Image: "minio/minio",
      HostConfig: {
        PortBindings: {
          "9000/tcp": [
            {
              HostPort: (await this.getPortNumber()).toString(),
            },
          ],
          "9001/tcp": [
            {
              HostPort: (await this.getConsolePortNumber()).toString(),
            },
          ],
        },
        Binds: [
          `${process.cwd() +
          this.callerInstance.getInstallationPath().substring(1)
          }/data:/data`,
        ],
      },
      ExposedPorts: {
        "9000/tcp": {},
        "9001/tcp": {},
      },
      Cmd: ["server", "/data", "--console-address", ":9001"],
    };
  }

  getStatus(): "up" | "down" {
    return this.status;
  }

  //@ts-ignore
  async getPortNumber(returnDefault?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.portNumber) {
        return resolve(this.portNumber);
      }
      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
      DockerodeHelper.getPort(10310, ports)
        .then((port: number) => {
          this.setPortNumber(port);
          ports.push(port);
          this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);
          return resolve(this.portNumber);
        })
        .catch((e: any) => {
          reject(e);
        });
    });
  }

  async getConsolePortNumber(returnDefault?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.consolePortNumber) {
        return resolve(this.consolePortNumber);
      }
      let ports =
        this.callerInstance.callerPlugin.gluePluginStore.get("console_ports") ||
        [];
      DockerodeHelper.getPort(9160, ports)
        .then((port: number) => {
          this.setConsolePortNumber(port);
          ports.push(port);
          this.callerInstance.callerPlugin.gluePluginStore.set(
            "console_ports",
            ports,
          );
          return resolve(this.consolePortNumber);
        })
        .catch((e: any) => {
          reject(e);
        });
    });
  }

  getContainerId(): string {
    return this.containerId;
  }

  setStatus(status: "up" | "down") {
    this.callerInstance.gluePluginStore.set("status", status || "down");
    return (this.status = status || "down");
  }

  setPortNumber(portNumber: number) {
    this.callerInstance.gluePluginStore.set("port_number", portNumber || null);
    return (this.portNumber = portNumber || null);
  }

  setConsolePortNumber(consolePortNumber: number) {
    this.callerInstance.gluePluginStore.set(
      "console_port_number",
      consolePortNumber || null,
    );
    return (this.consolePortNumber = consolePortNumber || null);
  }

  setContainerId(containerId: string) {
    this.callerInstance.gluePluginStore.set(
      "container_id",
      containerId || null,
    );
    return (this.containerId = containerId || null);
  }

  setDockerfile(dockerfile: string) {
    this.callerInstance.gluePluginStore.set("dockerfile", dockerfile || null);
    return (this.dockerfile = dockerfile || null);
  }

  getConfig(): any { }

  async up() {
    this.getEnv();
    await this.getPortNumber();
    await this.getConsolePortNumber();

    this.setStatus("up");

    await new Promise(async (resolve, reject) => {
      if (this.callerInstance.gluePluginStore.get("minio_credentials")?.external) {
        createBucket(this)
          .then(() => {
            return resolve(true);
          })
          .catch(() => {
            console.log("\x1b[33m");
            console.log(
              `Could not create buckets, please create public and private buckets manually`,
            );
            console.log("\x1b[0m");
          });

        return resolve(true);
      }
    });
  }

  async down() {
    this.setStatus("down");
  }

  async build() { }
}
