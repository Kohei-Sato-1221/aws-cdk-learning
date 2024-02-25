import * as aws from "aws-sdk";
const s3 = new aws.S3();
/**
 * ジョブ実行クラス
 */
export class JobExecutor {
  /**
   * バケット内のオブジェクトを削除します。
   *
   * @param {string} bucketName バケット名
   * @param {string} objectKey オブジェクトキー * @returns {Promise<void>}
   */
  public static async execute(
    bucketName: string,
    objectKey: string
  ): Promise<void> {
    console.log(
      `JobExecutor.execute bucketName:${bucketName}/objectKey:${objectKey}`
    );
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: objectKey,
      })
      .promise();
  }
}
