/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/**
 * WhaleTransaction
 * @example {"btc":1340.55,"cluster":2,"fee_per_max_ratio":0.000042,"input_count":3,"max_input_address":"1ABCDxyz...","max_input_ratio":0.95,"max_output_address":"bc1QWErty...","max_output_ratio":0.78,"output_count":4,"timestamp":"2025-06-21T15:30:00"}
 */
export interface WhaleTransaction {
  /**
   * Cluster
   * 예측된 클러스터 번호
   */
  cluster?: number | null;
  /**
   * Btc
   * 총 입력값(BTC)
   */
  btc: number;
  /**
   * Input Count
   * Input 개수
   */
  input_count: number;
  /**
   * Output Count
   * Output 개수
   */
  output_count: number;
  /**
   * Max Output Ratio
   * 최대 Output 비율
   */
  max_output_ratio: number;
  /**
   * Max Input Ratio
   * 최대 Input 비율
   */
  max_input_ratio: number;
  /**
   * Fee Per Max Ratio
   * 수수료 / 최대 output 비율
   */
  fee_per_max_ratio: number;
  /**
   * Timestamp
   * 트랜잭션 발생 시간
   * @format date-time
   */
  timestamp: string;
  /**
   * Max Input Address
   * 가장 큰 input 주소
   */
  max_input_address?: string | null;
  /**
   * Max Output Address
   * 가장 큰 output 주소
   */
  max_output_address?: string | null;
}

/**
 * WhaleTransactionList
 * @example {"logs":[{"btc":1340.55,"cluster":2,"fee_per_max_ratio":0.000042,"input_count":3,"max_input_address":"1ABCDxyz...","max_input_ratio":0.95,"max_output_address":"bc1QWErty...","max_output_ratio":0.78,"output_count":4,"timestamp":"2025-06-21T15:30:00"}]}
 */
export interface WhaleTransactionList {
  /** Logs */
  logs: WhaleTransaction[];
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Whale Detection API
 * @version 1.0.0
 *
 *
 *             이 API는 블록체인 네트워크에서 고래 거래를 감지하고,
 *             실시간으로 클러스터링 결과를 제공합니다.
 *             - WebSocket을 통해 실시간 거래 데이터를 수신합니다.
 *             - 탐지되는 고래의 최소 거래단위는 200BTC입니다.
 *             - 거래 데이터를 클러스터링하여 고래 거래를 식별합니다.
 *             - SSE(Server-Sent Events)를 통해 클라이언트에 실시간 알림을 전송합니다.
 *             - MongoDB에 거래 로그를 저장합니다.
 *
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description 클라이언트가 SSE를 통해 실시간으로 고래 거래 알림을 받을 수 있습니다. 쿼리파라미터 `min_input_value`를 통해 알림 최소 기준값을 지정할 수 있습니다. ### 예시 요청 `GET /api/stream?min_input_value=1000`  *(기본값 1000)* ### 예시 전송 메시지 (JSON) ```json data: { "cluster": 2, "btc": 1234.56, "input_count": 3, "output_count": 4, "max_output_ratio": 0.78, "max_input_ratio": 0.91, "fee_per_max_ratio": 0.000032, "timestamp": "2025-06-21T16:45:00", "max_input_address": "1ABCDxyz...", "max_output_address": "bc1qWErty..." } ```
     *
     * @name StreamApiStreamGet
     * @summary SSE 실시간 고래 탐지 알림
     * @request GET:/api/stream
     */
    streamApiStreamGet: (
      query?: {
        /**
         * Min Input Value
         * @default 1000
         */
        min_input_value?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/api/stream`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description MongoDB에 저장된 최근 N개 고래 거래 로그를 반환합니다. 기본 20건
     *
     * @name GetLogsApiLogsGet
     * @summary 최신순으로 고래 탐지 로그 N건 조회
     * @request GET:/api/logs
     */
    getLogsApiLogsGet: (
      query?: {
        /**
         * Limit
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<WhaleTransactionList, HTTPValidationError>({
        path: `/api/logs`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description `total_input_value`가 특정값 이상인 고래 거래를 조회합니다.
     *
     * @name GetWhalesApiWhalesGet
     * @summary 특정 BTC 이상 고래 거래 조회
     * @request GET:/api/whales
     */
    getWhalesApiWhalesGet: (
      query?: {
        /**
         * Min Value
         * @default 1000
         */
        min_value?: number;
        /**
         * Limit
         * @default 10
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<WhaleTransactionList, HTTPValidationError>({
        path: `/api/whales`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
