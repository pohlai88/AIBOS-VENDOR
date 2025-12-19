import { createClient } from "./supabase/server";

export async function logDocumentAccess(
  documentId: string,
  userId: string,
  action: "view" | "download" | "upload" | "delete" | "update"
) {
  const supabase = await createClient();

  await supabase.from("document_access_logs").insert({
    document_id: documentId,
    user_id: userId,
    action,
  });
}

