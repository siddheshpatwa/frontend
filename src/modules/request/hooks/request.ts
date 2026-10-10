import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRequestToCollection,
  getAllRequestFromCollection,
  Request,
  run,
  saveRequest,
  sendRequest,
} from "../action";
import type { ResponseData } from "../components/response-viewer";
import { useRequestPlaygroundStore } from "../store/useRequeststore";

type DbRequest = Awaited<ReturnType<typeof saveRequest>>;

// Json columns come back as unknown; the tab store keeps them as strings.
const toSaved = (r: DbRequest) => ({
  id: r.id,
  name: r.name,
  method: r.method as string,
  url: r.url,
  body: typeof r.body === "string" ? r.body : undefined,
  headers: typeof r.headers === "string" ? r.headers : undefined,
  parameters: typeof r.parameters === "string" ? r.parameters : undefined,
});

export function useAddRequestToCollection(collectionId: string) {
  const queryClient = useQueryClient();
  const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  return useMutation({
    mutationFn: async (value: Request) => addRequestToCollection(collectionId, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
      if (activeTabId) updateTabFromSavedRequest(activeTabId, toSaved(data));
    },
  });
}

export function useGetAllRequestFromCollection(collectionId: string) {

  return useQuery({
    queryKey: ["requests", collectionId],
    queryFn: async () => getAllRequestFromCollection(collectionId),
  });
}

export function useSaveRequest(id: string) {
 const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: Request) => saveRequest(id, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      if (activeTabId) updateTabFromSavedRequest(activeTabId, toSaved(data));
    },
  });
}


type RunTab = {
  requestId?: string;
  method: string;
  url: string;
  headers?: string;
  parameters?: string;
  body?: string;
};

export function useRunRequest(tab: RunTab) {
  const { setResponseViewerData } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ResponseData> => {
      // Saved requests are run (and logged) from the database.
      if (tab.requestId) return (await run(tab.requestId)) as ResponseData;

      // Unsaved tabs are sent directly and not stored.
      const result = await sendRequest({
        method: tab.method,
        url: tab.url,
        headers: tab.headers,
        params: tab.parameters,
        body: tab.body,
      });
      const data = result.data;
      return {
        success: !result.error,
        error: result.error,
        result,
        requestRun: {
          id: "unsaved",
          status: result.status ?? 0,
          statusText: result.statusText ?? (result.error ? "Error" : null),
          headers: result.headers ?? {},
          body: result.error
            ? result.error
            : data === undefined || data === null || data === ""
              ? null
              : typeof data === "string"
                ? data
                : JSON.stringify(data),
          durationMs: result.duration,
        },
      } as ResponseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setResponseViewerData(data);
    },
  });
}
