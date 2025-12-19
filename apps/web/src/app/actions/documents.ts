'use server'

import 'server-only'
import { revalidateTag, revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { logDocumentAccess } from '@/lib/documents'
import { logError } from '@/lib/logger'

/**
 * Server Action: Delete a document
 * Follows Next.js 16 best practices for Server Actions
 */
export async function deleteDocument(formData: FormData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'Document ID is required' }
    }

    // Fetch document to check permissions
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !document) {
      return { success: false, error: 'Document not found' }
    }

    // Check permissions
    const canDelete =
      document.created_by === user.id ||
      (document.organization_id === user.organizationId &&
        (user.role === 'company_admin' || user.role === 'company_user'))

    if (!canDelete) {
      return { success: false, error: 'Access denied' }
    }

    // Delete file from storage
    const fileName = document.file_url.split('/').pop()
    if (fileName) {
      await supabase.storage
        .from('documents')
        .remove([`${document.organization_id}/${fileName}`])
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logError('[Server Action] Document delete error', deleteError, {
        documentId: id,
        userId: user.id,
      })
      return { success: false, error: 'Failed to delete document' }
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, 'delete')

    // Trigger webhook (non-blocking)
    const { deliverWebhook } = await import('@/lib/webhooks')
    deliverWebhook(
      'document.deleted',
      {
        documentId: document.id,
        name: document.name,
        organizationId: user.organizationId,
      },
      user.organizationId
    ).catch((error) => {
      logError('[Webhook] Document delete webhook failed', error, {
        documentId: document.id,
      })
    })

    // Revalidate cache with targeted tags (best practice)
    // Note: revalidateTag requires 2 arguments in Next.js 16 (tag, profile)
    revalidateTag('documents', 'max')
    revalidateTag(`documents:tenant:${user.tenantId}`, 'max')
    revalidateTag(`documents:org:${user.organizationId}`, 'max')
    revalidateTag(`documents:${id}`, 'max') // Specific document
    revalidatePath('/documents') // Revalidate the documents page

    return { success: true }
  } catch (error) {
    logError('[Server Action] Document delete error', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server Action: Update document metadata
 */
export async function updateDocument(formData: FormData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const category = formData.get('category') as string | null
    const isShared = formData.get('isShared') === 'true'

    if (!id || !name) {
      return { success: false, error: 'Document ID and name are required' }
    }

    // Fetch document to check permissions
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !document) {
      return { success: false, error: 'Document not found' }
    }

    // Check permissions
    const canUpdate =
      document.created_by === user.id ||
      (document.organization_id === user.organizationId &&
        (user.role === 'company_admin' || user.role === 'company_user'))

    if (!canUpdate) {
      return { success: false, error: 'Access denied' }
    }

    // Update document
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        name,
        category: category || document.category,
        is_shared: isShared,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logError('[Server Action] Document update error', updateError, {
        documentId: id,
        userId: user.id,
      })
      return { success: false, error: 'Failed to update document' }
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, 'update')

    // Revalidate cache with targeted tags
    // Note: revalidateTag requires 2 arguments in Next.js 16 (tag, profile)
    revalidateTag('documents', 'max')
    revalidateTag(`documents:tenant:${user.tenantId}`, 'max')
    revalidateTag(`documents:org:${user.organizationId}`, 'max')
    revalidateTag(`documents:${id}`, 'max') // Specific document
    revalidatePath('/documents')

    return { success: true, document: updatedDocument }
  } catch (error) {
    logError('[Server Action] Document update error', error)
    return { success: false, error: 'Internal server error' }
  }
}
