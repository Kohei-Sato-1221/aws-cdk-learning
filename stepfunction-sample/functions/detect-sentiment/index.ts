import { JobExecutor, IJobParameter } from "./job-executor";

export interface IStateRequest {
  id: string;
  detail: {
    requestParameters: {};
  };
  srcBucket: string;
  objectKey: string;
}
/**
 * ステート応答インタフェース
 */
export interface IStateResponse {
  id: string;
  srcBucket: string;
  objectKey: string;
  destBucket: string;
}

export async function handler(event: IStateRequest): Promise<IStateResponse> {
  console.log("event:");
  console.log(event);
  const job: IJobParameter = {
    id: event.id,
    srcBucket: event.srcBucket,
    objectKey: event.objectKey,
    destBucket: process.env.DEST_BUCKET!,
  };
  await JobExecutor.execute(job);
  return job;
}
