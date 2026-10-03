'use client';

/**
 * The Studio's client-side view of its server actions: each call returns the value, or
 * throws an Error carrying the server's real message (see `run` in actions.ts).
 */
import * as A from '@/app/(studio)/studio/actions';
import type { Result } from '@/app/(studio)/studio/actions';

function unwrap<Args extends unknown[], T>(fn: (...a: Args) => Promise<Result<T>>) {
  return async (...a: Args): Promise<T> => {
    const r = await fn(...a);
    if (!r.ok) throw new Error(r.error);
    return r.data;
  };
}

export const listPages = unwrap(A.listPages);
export const getPage = unwrap(A.getPage);
export const savePageDraft = unwrap(A.savePageDraft);
export const publishPage = unwrap(A.publishPage);
export const createPage = unwrap(A.createPage);
export const duplicatePage = unwrap(A.duplicatePage);
export const deletePage = unwrap(A.deletePage);
export const listPageVersions = unwrap(A.listPageVersions);
export const restorePageVersion = unwrap(A.restorePageVersion);
export const getGlobal = unwrap(A.getGlobal);
export const saveGlobal = unwrap(A.saveGlobal);
export const listMedia = unwrap(A.listMedia);
export const uploadMedia = unwrap(A.uploadMedia);
export const updateMedia = unwrap(A.updateMedia);
export const deleteMedia = unwrap(A.deleteMedia);
export const listProjects = unwrap(A.listProjects);
export const getProject = unwrap(A.getProject);
export const saveProject = unwrap(A.saveProject);
export const deleteProject = unwrap(A.deleteProject);
export const listPosts = unwrap(A.listPosts);
export const getPost = unwrap(A.getPost);
export const savePost = unwrap(A.savePost);
export const deletePost = unwrap(A.deletePost);
export const listServices = unwrap(A.listServices);
export const getService = unwrap(A.getService);
export const saveService = unwrap(A.saveService);
export const deleteService = unwrap(A.deleteService);
export const listEnquiries = unwrap(A.listEnquiries);
export const setEnquiryStatus = unwrap(A.setEnquiryStatus);
export const deleteEnquiry = unwrap(A.deleteEnquiry);
