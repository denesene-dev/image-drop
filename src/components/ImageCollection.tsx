import {
  createContext,
  useCallback,
  useState,
  useContext,
  Fragment,
} from "react";
import { filesize } from "filesize";

// Card components
import { Button, Card, CardBody, Tooltip } from "@nextui-org/react";

// Lottie animation
import animationData from "./../Animation.json";
import Lottie from "lottie-react";

// Import types..
import type {
  ImageCollectionProps,
  ImageCollectionContext,
  ImageCollectionType,
  ImageList,
  ImageListItem,
} from "../types";

import type { ChangeEvent } from "react";

// Helpers
import { v4 as uuidv4 } from "uuid";

// Icons
import { BiCollection, BiReset } from "react-icons/bi";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { FiTrash2 } from "react-icons/fi";

const ImgCollectionCtx = createContext<ImageCollectionType>(null);

const limitString = (str: string, limit: number) => {
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit) + "...";
  }
};

const DroppableAnimation = ({ height }: { height: number }) => (
  <Lottie animationData={animationData} style={{ height }} />
);

const FileInput = () => {
  const context = useContext(ImgCollectionCtx);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      const errMsg = "Resim yüklenirken beklenmedik bir sorun oluştu.";

      if (context !== null && files !== null) {
        const { maxFileSize, imageStore } = context;

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
        );

        const filteredResult = result.filter(
          (item) => item !== null
        ) as ImageList;

        imageStore.setter(filteredResult);
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

const NoImageView = () => (
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
    <div className="grid grid-cols-[75px_1fr] gap-6 items-center py-4 px-2">
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

const ListView = () => {
  const context = useContext(ImgCollectionCtx);

  if (context === null) return;

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
          <BiCollection /> {context.imageStore.getter.length} resim yüklenmeye
          hazır.
        </h1>
        <p className="text-xs text-gray-600">
          Resmi tam ekranda görüntülemek veya listeden kaldırmak için resme
          tıklayabilirsiniz. Resmi yükledikten sonra 'Karşıya Yükle' butonuna
          basarak yükleme işlemini tamamlayabilirsiniz.
        </p>
      </div>

      {context.imageStore.getter.map((item, key) => (
        <ListItem data={item} key={key} />
      ))}
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
          className="bg-[#04764e] text-green-50 font-semibold text-lg"
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

export default function ImageCollection({ maxFileSize }: ImageCollectionProps) {
  const [imageList, setImageList] = useState<ImageList>([]);

  const isImageUploaded = imageList.length > 0;

  const imgInitialContext: ImageCollectionContext = {
    imageStore: {
      getter: imageList,
      setter: setImageList,
    },
    maxFileSize: maxFileSize,
  };

  return (
    <ImgCollectionCtx.Provider value={imgInitialContext}>
      <Card className="relative mx-3 md:mx-0 group">
        {!isImageUploaded && <FileInput />}

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
