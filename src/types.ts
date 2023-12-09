import type { Dispatch, SetStateAction } from "react";

interface StateHook<StateType> {
  getter: StateType;
  setter: Dispatch<SetStateAction<StateType>>;
}

export interface ImageCollectionContext extends ImageCollectionProps {
  imageStore: StateHook<ImageList>;
  isFileReading: StateHook<boolean>;
}

export type ImageCollectionType = ImageCollectionContext | null;

export interface ImageListItem {
  _id: string;
  name: string;
  tempUrl: string;
  size: number;
}

export type ImageList = Array<ImageListItem>;

export interface ImageCollectionProps {
  /**
   * Number of megabayts of the image file
   */
  maxFileSize: number;
}

export interface FileInputProps {
  type: "insert" | "update";
}
