import { v4 } from "uuid";
import { filesize } from "filesize";

export const limitString = (str: string, limit: number) => {
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit) + "...";
  }
};

export { v4 as uuidv4, filesize };
