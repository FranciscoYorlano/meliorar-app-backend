export interface MessageAPI {
  code: string;
  status: number;
  component: string;
  description: string;
  errorString?: string;
}

export interface Messages {
  [key: string]: MessageAPI;
}
