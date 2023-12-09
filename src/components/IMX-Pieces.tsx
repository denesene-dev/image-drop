import { useCallback, useContext, Fragment } from "react";

// Card components
import { Button, Skeleton, Tooltip } from "@nextui-org/react";

// Lottie animation
import animationData from "./../Animation.json";
import Lottie from "lottie-react";

// Import types..
import type { ImageList, ImageListItem, FileInputProps } from "../types";

import type { ChangeEvent } from "react";

// Icons
import { BiCollection, BiReset } from "react-icons/bi";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { FiTrash2 } from "react-icons/fi";
import { LuFilePlus2 } from "react-icons/lu";
import { ImgCollectionCtx } from "./ImageCollection";
import { filesize, limitString, uuidv4 } from "../helper-functions";

const LoadingView = ({ stackCount }: { stackCount: number }) =>
  Array.from({ length: stackCount }, (_, i) => (
    <div className="list-item" key={i}>
      <Skeleton className="rounded-lg w-[75px] h-[75px]">
        <div className="h-24 rounded-lg bg-default-300"></div>
      </Skeleton>

      <div className="space-y-3">
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-1/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
      </div>
    </div>
  ));

const AddMultipleFile = () => (
  <div className="relative my-2">
    <FileInput type="insert" />

    <div className="flex items-center justify-center gap-3 text-gray-800 w-full border-3 border-dashed border-gray-400 rounded-xl py-3 px-6 text-lg">
      <LuFilePlus2 size={24} /> Yeni resim yükle
    </div>
  </div>
);

const DroppableAnimation = ({ height }: { height: number }) => (
  <Lottie animationData={animationData} style={{ height }} />
);

export const FileInput = ({ type }: FileInputProps) => {
  const context = useContext(ImgCollectionCtx);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      const errMsg = "Resim yüklenirken beklenmedik bir sorun oluştu.";

      if (context !== null && files !== null) {
        const { maxFileSize, imageStore, isFileReading } = context;

        isFileReading.setter(true);

        const result = await Promise.all(
          Array.from(files).map(async (file) => {
            if (file.size > maxFileSize * 1024 * 1024) return null;

            const reader = new FileReader();

            const loadImage = (): Promise<string> =>
              new Promise((resolve, reject) => {
                reader.onload = (event) => {
                  const dataURL = event.target?.result as string;
                  dataURL ? resolve(dataURL) : reject(new Error(errMsg));
                };

                reader.onerror = () => reject(errMsg);
                reader.readAsDataURL(file);
              });

            try {
              const tempUrl = await loadImage();
              const genRandId = uuidv4();
              return {
                _id: genRandId,
                name: file.name,
                size: file.size,
                tempUrl,
              };
            } catch (e) {
              if (e instanceof Error) {
                alert(e.message);
                console.error("FileReadErr: ", e);
              } else {
                console.error("Unexpected error: ", e);
              }

              return null;
            }
          })
        ).finally(() => isFileReading.setter(false));

        const filteredResult = result.filter(
          (item) => item !== null
        ) as ImageList;

        switch (type) {
          case "insert":
            imageStore.setter((prevState) => [...prevState, ...filteredResult]);
            break;
          case "update":
            imageStore.setter(filteredResult);
            break;
        }
      }
    },
    [context]
  );

  return (
    <input
      className="absolute top-0 h-full appearance-none opacity-0 z-10 w-full cursor-pointer"
      onChange={handleFileChange}
      accept="image/png, image/jpeg, image/jpg"
      type="file"
      multiple
    />
  );
};

export const NoImageView = () => (
  <div className="flex items-start md:items-center flex-col px-3 md:px-6 rounded-2xl">
    <DroppableAnimation height={250} />

    <div className="md:text-center pr-4 pb-6 select-none mb-10">
      <h1 className="text-zinc-950 text-2xl">
        Resim yüklemek için tıklayın veya sürükleyin.
      </h1>

      <p className="md:text-xl pt-3 text-zinc-700 leading-7">
        Birden fazla <code>jpeg</code> veya <code>png</code> formatında resim
        yükleyebilirsiniz.
      </p>
    </div>
  </div>
);

const ListItem = ({ data }: { data: ImageListItem }) => {
  const context = useContext(ImgCollectionCtx);
  if (context === null) return null;

  const removeItem = () => {
    context.imageStore.setter((previousState) =>
      previousState.filter((item) => item._id !== data._id)
    );
  };

  return (
    <div className="list-item">
      <img
        src={data.tempUrl}
        alt={data.name}
        className="w-[75px] h-[75px] object-contain bg-white border rounded-xl"
      />

      <div className="relative pr-14">
        <Tooltip content="Kaldır" color="danger">
          <Button
            color="danger"
            variant="ghost"
            className="absolute top-2/4 right-0 -translate-y-2/4"
            onPress={removeItem}
            isIconOnly
          >
            <FiTrash2 size={20} />
          </Button>
        </Tooltip>

        <h3 className="text-lg font-semibold text-zinc-900" title={data.name}>
          {limitString(data.name, 35)}
        </h3>
        <small className="text-gray-500">
          {filesize(data.size, { standard: "jedec" })}
        </small>
      </div>
    </div>
  );
};

export const ListView = () => {
  const context = useContext(ImgCollectionCtx);

  if (context === null) return;

  const { isFileReading, imageStore } = context;
  const fileCount = imageStore.getter.length;

  const resetList = () => {
    context.imageStore.setter([]);
  };

  const handleUpload = () => {
    alert(
      "context structure will be edited according to fetch endpoint and body content pattern"
    );
  };

  return (
    <Fragment>
      <div className="px-4 py-2 mb-2">
        <h1 className="flex items-center text-slate-700 text-2xl gap-3 mb-4">
          <BiCollection /> {fileCount} resim yüklenmeye hazır.
        </h1>
        <p className="text-xs text-gray-500">
          Tabloda en fazla 4MB boyutunda olan <code>jpeg</code> veya{" "}
          <code>png</code> uzantılı resim dosyalarınızı bulabilirsiniz. Yeni bir
          resim seçmek için aşağıdaki alana resimlerinizi sürükleyebilir veya
          tıklayabilirsiniz: 'Yeni resim yükle'.
        </p>
      </div>

      {isFileReading.getter ? (
        <LoadingView stackCount={3} />
      ) : (
        <Fragment>
          {context.imageStore.getter.map((item, key) => (
            <ListItem data={item} key={key} />
          ))}
          <AddMultipleFile />
        </Fragment>
      )}

      <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
        <Button
          color="danger"
          onPress={resetList}
          variant="faded"
          startContent={<BiReset />}
          fullWidth
        >
          Seçimi Sıfırla
        </Button>

        <Button
          className="bg-[#04764e] text-green-50"
          startContent={<HiOutlineCloudUpload />}
          onPress={handleUpload}
          fullWidth
        >
          Karşıya Yükle
        </Button>
      </div>
    </Fragment>
  );
};
