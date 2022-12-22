const { DockerodeHelper } = require("@gluestack/helpers");
import IApp from "@gluestack/framework/types/app/interface/IApp";
import IInstance from "@gluestack/framework/types/plugin/interface/IInstance";
import IContainerController from "@gluestack/framework/types/plugin/interface/IContainerController";
import { IMinio } from "./interfaces/IMinio";
import { constructEnv } from "./helpers/constructEnv";

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

  getEnv() {
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
      MINIO_PORT: this.getPortNumber(),
      MINIO_USE_SSL: false,
      MINIO_ACCESS_KEY: minio_credentials.username,
      MINIO_SECRET_KEY: minio_credentials.password,
      MINIO_BUCKET: this.getBucketName(),
    };
  }

  getDockerJson() {
    return {
      Image: "minio/minio",
      HostConfig: {
        PortBindings: {
          "9000/tcp": [
            {
              HostPort: this.getPortNumber(true).toString(),
            },
          ],
          "9001/tcp": [
            {
              HostPort: this.getConsolePortNumber(true).toString(),
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

  getPortNumber(returnDefault?: boolean): number {
    if (this.portNumber) {
      return this.portNumber;
    }
    if (returnDefault) {
      return 9001;
    }
  }

  getConsolePortNumber(returnDefault?: boolean): number {
    if (this.consolePortNumber) {
      return this.consolePortNumber;
    }
    if (returnDefault) {
      return 9100;
    }
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
    let ports =
      this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];

    let consolePorts =
      this.callerInstance.callerPlugin.gluePluginStore.get("console_ports") ||
      [];

    await new Promise(async (resolve, reject) => {
      DockerodeHelper.getPort(this.getPortNumber(true), ports)
        .then(async (port: number) => {
          DockerodeHelper.getPort(this.getConsolePortNumber(true), consolePorts)
            .then(async (consolePort: number) => {
              this.portNumber = port;
              this.consolePortNumber = consolePort;
              DockerodeHelper.up(
                this.getDockerJson(),
                this.getEnv(),
                this.portNumber,
                this.callerInstance.getName(),
              )
                .then(
                  ({
                    status,
                    portNumber,
                    containerId,
                  }: {
                    status: "up" | "down";
                    portNumber: number;
                    containerId: string;
                    dockerfile: string;
                  }) => {
                    DockerodeHelper.generateDockerFile(
                      this.getDockerJson(),
                      this.getEnv(),
                      this.callerInstance.getName(),
                    );
                    this.setStatus(status);
                    this.setPortNumber(portNumber);
                    this.setConsolePortNumber(consolePort);
                    this.setContainerId(containerId);
                    ports.push(portNumber);
                    consolePorts.push(consolePort);
                    this.callerInstance.callerPlugin.gluePluginStore.set(
                      "ports",
                      ports,
                    );
                    this.callerInstance.callerPlugin.gluePluginStore.set(
                      "console_ports",
                      consolePorts,
                    );
                    console.log("\x1b[32m");
                    console.log(
                      `API: http://localhost:${this.getPortNumber()}`,
                    );
                    console.log(
                      `Console: http://localhost:${this.getConsolePortNumber()}/ open in browser`,
                    );
                    console.log("\x1b[0m");
                    console.log("\x1b[36m");
                    console.log(`Credentials to login in minio console: `);
                    console.log(`username: ${this.getEnv().MINIO_ACCESS_KEY}`);
                    console.log(`password: ${this.getEnv().MINIO_SECRET_KEY}`);
                    console.log("\x1b[0m");
                    console.log(`Env for using minio API: `);
                    console.log(constructEnv(this.getEnv()));
                    return resolve(true);
                  },
                )
                .catch((e: any) => {
                  return reject(e);
                });
            })
            .catch((e: any) => {
              return reject(e);
            });
        })
        .catch((e: any) => {
          return reject(e);
        });
    });
  }

  async down() {
    let ports =
      this.callerInstance.callerPlugin.gluePluginStore.get("ports") || [];
    let consolePorts =
      this.callerInstance.callerPlugin.gluePluginStore.get("console_ports") ||
      [];
    await new Promise(async (resolve, reject) => {
      DockerodeHelper.down(this.getContainerId(), this.callerInstance.getName())
        .then(() => {
          this.setStatus("down");
          var index = ports.indexOf(this.getPortNumber());
          if (index !== -1) {
            ports.splice(index, 1);
          }
          this.callerInstance.callerPlugin.gluePluginStore.set("ports", ports);

          var consoleIndex = consolePorts.indexOf(this.getConsolePortNumber());
          if (consoleIndex !== -1) {
            consolePorts.splice(consoleIndex, 1);
          }
          this.callerInstance.callerPlugin.gluePluginStore.set(
            "console_ports",
            consolePorts,
          );

          this.setPortNumber(null);
          this.setConsolePortNumber(null);
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
