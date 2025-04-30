import Request from "@/utils/request";
import { Assistant } from "@/types/app/assistant";

export const getAssistantListAPI = () =>
  Request<Assistant[]>("GET", "/assistant/list");

export const getAssistantDataAPI = (id?: number) =>
  Request<Assistant>("GET", `/assistant/${id}`);

export const addAssistantDataAPI = (data: Assistant) =>
  Request("POST", "/assistant", { data });

export const delAssistantDataAPI = (id: number) =>
  Request("DELETE", `/assistant/${id}`);

export const editAssistantDataAPI = (data: Assistant) =>
  Request("PUT", "/assistant", { data });

export const setDefaultAssistantDataAPI = (id: number) =>
  Request("PATCH", `/assistant/setDefault/${id}`);

export const processDocument = (data: {
  content: string;
  operation: string;
}) => Request("POST", "/assistant/processDocument", { data: data, responseType: 'stream' });

export const generateTitleAndDescription = (data: {
  content: string;
}) => Request("POST", "/assistant/generateTitleAndDescription", { data });