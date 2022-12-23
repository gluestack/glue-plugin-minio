const { DockerodeHelper } = require("@gluestack/helpers");
import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";
import { IMinio } from "./interfaces/IMinio";
import { constructEnv } from "./helpers/constructEnv";
import { createBucket } from "./helpers/createBucket";

export class PluginInstanceContainerController
  implements IContainerController, IMinio
{
  app: IApp;
  status: "up" | "down" = "down";
  portNumber: number;
  consolePortNumber: number;
  containerId: string;
  dockerfile: string;
  callerInstance: IInstance;
  bucketName: string = "public";

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

  getBucketName(): string {
    return this.bucketName;
  }

  getCallerInstance(): IInstance {
    return this.callerInstance;
  }

  async getEnv() {
    let minio_credentials = {
      username: "gluestack",
      password: "password",
    };

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
      MINIO_END_POINT: "127.0.0.1",
      MINIO_PORT: await this.getPortNumber(),
      MINIO_USE_SSL: false,
      MINIO_ACCESS_KEY: minio_credentials.username,
      MINIO_SECRET_KEY: minio_credentials.password,
      MINIO_BUCKET: this.getBucketName(),
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
          `${
            process.cwd() +
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

  getConfig(): any {}

  async up() {
    await new Promise(async (resolve, reject) => {
      DockerodeHelper.up(
        await this.getDockerJson(),
        await this.getEnv(),
        await this.getPortNumber(),
        this.callerInstance.getName(),
      )
        .then(
          async ({
            status,
            containerId,
          }: {
            status: "up" | "down";
            containerId: string;
          }) => {
            this.setStatus(status);
            this.setContainerId(containerId);
            console.log("\x1b[32m");
            console.log(`API: http://localhost:${await this.getPortNumber()}`);
            console.log(
              `Console: http://localhost:${await this.getConsolePortNumber()}/ open in browser`,
            );
            console.log("\x1b[0m");
            console.log("\x1b[36m");
            console.log(`Credentials to login in minio console: `);
            console.log(`username: ${(await this.getEnv()).MINIO_ACCESS_KEY}`);
            console.log(`password: ${(await this.getEnv()).MINIO_SECRET_KEY}`);
            console.log("\x1b[0m");
            console.log(`Env for using minio API: `);
            console.log(constructEnv(await this.getEnv()));

            createBucket(this)
              .then(() => {
                return resolve(true);
              })
              .catch(() => {
                console.log("\x1b[33m");
                console.log(
                  `Could not create public bucket, please create one manually`,
                );
                console.log("\x1b[0m");
              });
          },
        )
        .catch((e: any) => {
          return reject(e);
        })
        .catch((e: any) => {
          return reject(e);
        });
    });
  }

  async down() {
    await new Promise(async (resolve, reject) => {
      DockerodeHelper.down(this.getContainerId(), this.callerInstance.getName())
        .then(() => {
          this.setStatus("down");
          this.setContainerId(null);
          return resolve(true);
        })
        .catch((e: any) => {
          return reject(e);
        });
    });
  }

  async build() {}
}
