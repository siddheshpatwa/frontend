import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspace, getWorkspaces, getWorkspaceById } from "../actions";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const result = await getWorkspaces();
      return result ?? [];
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => createWorkspace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}


export function useGetWorkspace(id: string | null | undefined) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getWorkspaceById(id);
      return result ?? null;
    },
    enabled: !!id,
  });
}