import { v4 } from "uuid";
import { filesize } from "filesize";
import { FinalResult } from "./types";

export const limitString = (str: string, limit: number) => {
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit) + "...";
  }
};

export const sleep = (data: {
  name: string;
  base64: string;
  context: string;
}): Promise<FinalResult> =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log(data);

      resolve({ img_url: v4() });
    }, 2000);
  });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(",")[1]; // Extracting only the base64 string
      resolve(base64Content);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

export { v4 as uuidv4, filesize };
