import * as aws from "aws-sdk";
const COMPREHEND_BATCH_SIZE = 25;
const s3 = new aws.S3();
const comprehend = new aws.Comprehend();
/**
 * ジョブパラメータインタフェース
 */
export interface IJobParameter {
  id: string;
  srcBucket: string;
  objectKey: string;
  destBucket: string;
}
/**
 * 感情分析インタフェース
 */
interface IComprehend {
  id: string;
  topic: string;
  language: string;
  content: string;
  sentiment?: string;
  score?: {
    positive?: number;
    negative?: number;
    neutral?: number;
    mixed?: number;
  };
}

export class JobExecutor {
  public static async execute(job: IJobParameter): Promise<void> {
    console.log("JobExecutor.getItems");
    const items = await JobExecutor.getItems(job.srcBucket, job.objectKey);
    console.log("JobExecutor.divideByLanguage");
    const dict = JobExecutor.divideByLanguage(items);
    for (const ary of dict) {
      console.log("jobExecutor.detectSentiment:" + ary[0]);
      await JobExecutor.detectSentiment(ary[0], ary[1]);
    }
    console.log("JobExecutor.putJsonLines");
    await JobExecutor.putJsonLines(job.destBucket, job.objectKey, items);
  }

  private static async getItems(
    srcBucket: string,
    objectKey: string
  ): Promise<IComprehend[]> {
    const res = await s3
      .getObject({
        Bucket: srcBucket,
        Key: objectKey,
      })
      .promise();
    const items: IComprehend[] = [];
    if (res.Body) {
      const lines = res.Body.toString().split(/\r?\n/);
      lines.forEach((text) => {
        if (text) {
          const obj: IComprehend = JSON.parse(text);
          items.push(obj);
        }
      });
    }
    return new Promise((resolve) => {
      resolve(items);
    });
  }

  private static divideByLanguage(
    items: IComprehend[]
  ): Map<string, IComprehend[]> {
    const dict = new Map<string, IComprehend[]>();
    items.forEach((item) => {
      const key = item.language;
      const list = dict.get(key) || [];
      list.push(item);
      dict.set(key, list);
    });
    return dict;
  }

  private static async detectSentiment(
    language: string,
    items: IComprehend[]
  ): Promise<void> {
    const blocks: IComprehend[][] = items.reduce<IComprehend[][]>(
      (prev, value, index) =>
        index % COMPREHEND_BATCH_SIZE
          ? prev
          : [...prev, items.slice(index, index + COMPREHEND_BATCH_SIZE)],
      []
    );
    for (const list of blocks) {
      const res = await comprehend
        .batchDetectSentiment({
          TextList: list.map((x) => x["content"]),
          LanguageCode: language,
        })
        .promise();
      res.ResultList.forEach((result) => {
        const index = result.Index;
        if (index !== undefined) {
          const doc = list[index];
          doc.sentiment = result.Sentiment;
          doc.score = {
            positive: result.SentimentScore?.Positive || 0,
            negative: result.SentimentScore?.Negative || 0,
            neutral: result.SentimentScore?.Neutral || 0,
            mixed: result.SentimentScore?.Mixed || 0,
          };
        }
      });
    }
  }

  /**
   * JSON Lines形式のオブジェクトを出力します。
   *
   * @param {string} destBucket 出力先バケット名
   * @param {string} objectKey オブジェクト名
   * @param {IComprehend[]} items 感情分析結果データ * @returns {Promise<void>}
   */
  private static async putJsonLines(
    destBucket: string,
    objectKey: string,
    items: IComprehend[]
  ): Promise<void> {
    const lines: string[] = [];
    items.forEach((item) => {
      const line = JSON.stringify(item);
      lines.push(line);
    });
    await s3
      .putObject({
        Bucket: destBucket,
        Key: objectKey,
        Body: lines.join("\n"),
      })
      .promise();
  }
}
