const prompts = require("prompts");
import { PluginInstance } from "..//PluginInstance";

interface IQuestion {
  type: any;
  name: string;
  message: string;
  initial: string | boolean;
}

export const defaultConfig = {
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
      name: "choice",
      message: "Do you want to use external minio?",
      initial: false
    },
    {
      type: (prev: any) => (prev === true ? 'text' : null),
      name: "username",
      message: "What is your minio username?",
      initial: oldConfig?.username || defaultConfig.username,
    },
    {
      type: (prev: any) => (prev ? 'text' : null),
      name: "password",
      message: "What is your minio password?",
      initial: oldConfig?.password || defaultConfig.password,
    },
    {
      type: (prev: any) => (prev ? 'text' : null),
      name: "admin_end_point",
      message: "What is your minio admin-end-point?",
      initial: oldConfig?.admin_end_point || defaultConfig.admin_end_point,
    },
    {
      type: (prev: any) => (prev ? 'text' : null),
      name: "cdn_end_point",
      message: "What is your minio cdn-end-point?",
      initial: oldConfig?.cdn_end_point || defaultConfig.cdn_end_point,
    },
    {
      type: (prev: any) => (prev ? 'text' : null),
      name: "port",
      message: "What is your minio port?",
      initial: oldConfig?.port || defaultConfig.port,
    }
  ];
};

export const writeInstance = async (pluginInstance: PluginInstance) => {
  let response = await prompts(
    getNewInstanceQuestions(pluginInstance.gluePluginStore.get("minio_credentials")),
  );

  if (!response.choice) {
    response = defaultConfig;
    response.port = `${await pluginInstance.containerController.getPortNumber()}`;
  } else {
    delete response.choice;
  }

  // trim the values in an object
  Object.keys(response).forEach(key => response[key] = response[key].trim());

  pluginInstance.gluePluginStore.set("minio_credentials", response);
  console.log();
  console.log(`Saved ${pluginInstance.getName()} config`);
  response.port = parseInt(response.port);
  console.table(response);
  console.log();
};