import type { Dispatch, SetStateAction } from "react";

interface StateHook<StateType> {
  getter: StateType;
  setter: Dispatch<SetStateAction<StateType>>;
}

export interface ImageCollectionContext extends ImageCollectionProps {
  imageStore: StateHook<ImageList>;
  loadingState: StateHook<boolean>;
}

export type ImageCollectionType = ImageCollectionContext | null;

export type FileUploadState = "uploading" | "inqueue" | "uploaded";

export interface ImageListItem {
  _id: string;
  name: string;
  tempUrl: string;
  size: number;
  base64: string;
  isUploaded: FileUploadState;
  [key: symbol]: () => Promise<FinalResult>;
}

type PartialStringOrBoolean<T> = {
  [P in keyof T]?: T[P] | boolean;
};

export type ImageList = Array<ImageListItem>;

export interface IMXRequestPayload
  extends PartialStringOrBoolean<ImageListItem> {
  [key: string]: any;
}

export interface ImageCollectionProps {
  /**
   * Number of megabayts of the image file
   */
  maxFileSize: number;

  /**
   * The context string to be used
   * in the fetch request
   */
  contextString: symbol;
}

export interface FileInputProps {
  type: "insert" | "update";
}

export interface Base64Response {
  base64String: string;
  base64Content: string;
}

export interface FinalResult {
  img_url: string;
}
