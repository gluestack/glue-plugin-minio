import { PluginInstanceContainerController } from "../PluginInstanceContainerController";
const Minio = require("minio");

async function getMinioClient(
  containerController: PluginInstanceContainerController,
) {
  return new Minio.Client({
    endPoint: "127.0.0.1",
    port: (await containerController.getEnv()).MINIO_PORT,
    useSSL: (await containerController.getEnv()).MINIO_USE_SSL,
    accessKey: (await containerController.getEnv()).MINIO_ACCESS_KEY,
    secretKey: (await containerController.getEnv()).MINIO_SECRET_KEY,
  });
}

async function tryCreateBucket(
  containerController: PluginInstanceContainerController,
) {
  return new Promise(async (resolve, reject) => {
    const minioClient = await getMinioClient(containerController);
    minioClient.bucketExists(
      (await containerController.getEnv()).MINIO_BUCKET,
      async function (err: any, exists: boolean) {
        if (exists) return resolve(true);
        if (err) return reject(err);
        minioClient.makeBucket(
          (await containerController.getEnv()).MINIO_BUCKET,
          "us-east-1",
          function (err: any) {
            if (err) return reject(err);
            minioClient.setBucketPolicy(
              "my-bucketname",
              JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: [
                      "s3:GetBucketLocation",
                      "s3:ListBucket",
                      "s3:ListBucketMultipartUploads",
                    ],
                    Resource: ["arn:aws:s3:::public"],
                  },
                  {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: [
                      "s3:DeleteObject",
                      "s3:GetObject",
                      "s3:ListMultipartUploadParts",
                      "s3:PutObject",
                      "s3:AbortMultipartUpload",
                    ],
                    Resource: ["arn:aws:s3:::public/*"],
                  },
                ],
              }),
              function (err: any) {
                if (err) return reject(err);
                return resolve(true);
              },
            );
          },
        );
      },
    );
  });
}

export async function createBucket(
  containerController: PluginInstanceContainerController,
) {
  let count = 0;

  return new Promise((resolve, reject) => {
    let interval = setInterval(async () => {
      await tryCreateBucket(containerController)
        .then((res: any) => {
          clearInterval(interval);
          return resolve(true);
        })
        .catch((e) => {});
      if (count > 10) {
        return reject("Bucket not created");
      }
      ++count;
    }, 5000);
  });
}
