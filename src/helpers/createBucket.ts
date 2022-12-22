import { PluginInstanceContainerController } from "src/PluginInstanceContainerController";
const Minio = require("minio");

function getMinioClient(
  çontainerController: PluginInstanceContainerController,
) {
  return new Minio.Client({
    endPoint: çontainerController.getEnv().MINIO_END_POINT,
    port: çontainerController.getEnv().MINIO_PORT,
    useSSL: çontainerController.getEnv().MINIO_USE_SSL,
    accessKey: çontainerController.getEnv().MINIO_ACCESS_KEY,
    secretKey: çontainerController.getEnv().MINIO_SECRET_KEY,
  });
}

async function tryCreateBucket(
  çontainerController: PluginInstanceContainerController,
) {
  return new Promise((resolve, reject) => {
    const minioClient = getMinioClient(çontainerController);
    minioClient.bucketExists(
      çontainerController.getEnv().MINIO_BUCKET,
      function (err: any, exists: boolean) {
        if (exists) return resolve(true);
        if (err) return reject(err);
        minioClient.makeBucket(
          çontainerController.getEnv().MINIO_BUCKET,
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
  çontainerController: PluginInstanceContainerController,
) {
  let count = 0;

  return new Promise((resolve, reject) => {
    let interval = setInterval(async () => {
      await tryCreateBucket(çontainerController)
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
