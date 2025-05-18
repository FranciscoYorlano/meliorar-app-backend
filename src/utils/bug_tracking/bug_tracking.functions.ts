import fs from 'fs';
import { MessageAPI } from './bug_tracking.types';

/**
 * bugTrackingGenerator
 * @param messageAPI MessageAPI
 * @param errorString string | null
 */
export const bugTrackingGenerator = (
  messageAPI: MessageAPI,
  errorString: string | null
): void => {
  const date: Date = new Date();

  const time = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

  const fileStorePath = `./file_store`;
  if (!fs.existsSync(fileStorePath)) {
    fs.mkdirSync(fileStorePath);
  }

  const bugTrackingPath = `./file_store/bug_tracking`;
  if (!fs.existsSync(bugTrackingPath)) {
    fs.mkdirSync(bugTrackingPath);
  }

  const completePath = `./file_store/bug_tracking/${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  if (!fs.existsSync(completePath)) {
    fs.mkdirSync(completePath);
  }

  /*
   * Write file
   */
  const errorFilePath = `${completePath}/${time}.json`;

  fs.writeFileSync(
    errorFilePath,
    JSON.stringify({ ...messageAPI, errorString: errorString })
  );
};
