const prompts = require("prompts");
import { PluginInstance } from "../PluginInstance";

interface IQuestion {
  type: any;
  name: string;
  message: string;
  initial: string | boolean;
}

export const defaultConfig = {
  external: false,
  username: "gluestack",
  password: "password",
  admin_end_point: "host.docker.internal",
  cdn_end_point: "127.0.0.1",
  port: "10310"
};

const getNewInstanceQuestions = (oldConfig: any): IQuestion[] => {
  return [
    {
      type: 'confirm',
      name: "external",
      message: "Do you want to use external minio?",
      initial: false
    },
    {
      type: 'text',
      name: "username",
      message: "What is your minio username?",
      initial: oldConfig?.username || defaultConfig.username,
    },
    {
      type: 'text',
      name: "password",
      message: "What is your minio password?",
      initial: oldConfig?.password || defaultConfig.password,
    }
  ];
};

const getExternalInstanceQuestions = (oldConfig: any): IQuestion[] => {
  return [
    {
      type: 'text',
      name: "admin_end_point",
      message: "What is your minio admin-end-point?",
      initial: oldConfig?.admin_end_point || defaultConfig.admin_end_point,
    },
    {
      type: 'text',
      name: "cdn_end_point",
      message: "What is your minio cdn-end-point?",
      initial: oldConfig?.cdn_end_point || defaultConfig.cdn_end_point,
    },
    {
      type: 'text',
      name: "port",
      message: "What is your minio port?",
      initial: oldConfig?.port || defaultConfig.port,
    }
  ];
};

export const writeInstance = async (pluginInstance: PluginInstance) => {
  let externalConfig;
  let response = await prompts(
    getNewInstanceQuestions(pluginInstance.gluePluginStore.get("minio_credentials")),
  );

  if (response.external) {
    externalConfig = await prompts(
      getExternalInstanceQuestions(pluginInstance.gluePluginStore.get("minio_credentials")),
    );
  }

  if (!response.external) {
    response.admin_end_point = defaultConfig.admin_end_point;
    response.cdn_end_point = defaultConfig.cdn_end_point;
    response.port = `${await pluginInstance.containerController.getPortNumber()}`;
    await pluginInstance.containerController.getConsolePortNumber();
  } else {
    response = { ...response, ...externalConfig };
  }

  // trim the values in an object
  Object.keys(response).forEach(key =>
    key !== 'external' ? response[key] = response[key].trim() : response[key]
  );

  pluginInstance.gluePluginStore.set("minio_credentials", response);
  console.log();
  console.log(`Saved ${pluginInstance.getName()} config`);
  response.port = parseInt(response.port);
  console.table(response);
  console.log();
};