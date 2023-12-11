import { createContext, useState } from "react";
// Card components
import { Card, CardBody } from "@nextui-org/react";
// Import types..
import type {
  ImageCollectionProps,
  ImageCollectionContext,
  ImageCollectionType,
  ImageList,
} from "../types";
// Icons
import { FileInput, ListView, NoImageView } from "./IMX-Pieces";

export const ImgCollectionCtx = createContext<ImageCollectionType>(null);

export default function ImageCollection({
  maxFileSize,
  contextString,
}: ImageCollectionProps) {
  const [imageList, setImageList] = useState<ImageList>([]);
  const [loadingState, setLoadingState] = useState(false);

  const isImageUploaded = imageList.length > 0;

  const imgInitialContext: ImageCollectionContext = {
    maxFileSize: maxFileSize,
    imageStore: {
      getter: imageList,
      setter: setImageList,
    },
    loadingState: {
      getter: loadingState,
      setter: setLoadingState,
    },
    contextString,
  };

  return (
    <ImgCollectionCtx.Provider value={imgInitialContext}>
      <Card className="relative mx-auto max-w-5xl group px-2" shadow="none">
        {!isImageUploaded && <FileInput type="update" />}
        <CardBody
          className="rounded-2xl"
          style={{
            border: !isImageUploaded ? "3px dashed rgb(180,83,9)" : undefined,
          }}
        >
          {isImageUploaded ? <ListView /> : <NoImageView />}
        </CardBody>
      </Card>
    </ImgCollectionCtx.Provider>
  );
}
