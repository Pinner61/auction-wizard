"use client"

import { useState, useCallback } from "react"
import { uploadFile, deleteFile, type UploadedFile } from "@/actions/upload-actions"

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    if (!files.length) return []

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
    })

    const uploadedFiles: UploadedFile[] = []
    const totalFiles = files.length

    try {
      // Process files sequentially to show accurate progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        // Update progress based on files completed
        setUploadState((prev) => ({
          ...prev,
          progress: Math.round((i / totalFiles) * 100),
        }))

        const result = await uploadFile(formData)

        if ("error" in result) {
          setUploadState({
            isUploading: false,
            progress: 0,
            error: `Error uploading ${file.name}: ${result.error}`,
          })
          throw new Error(result.error)
        }

        uploadedFiles.push(result)
      }

      // All files uploaded successfully
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
      })

      return uploadedFiles
    } catch (error) {
      console.error("Upload error:", error)
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      }))
      return uploadedFiles // Return any files that did upload successfully
    }
  }, [])

  const removeFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      const result = await deleteFile(fileId)

      if ("error" in result) {
        setUploadState((prev) => ({
          ...prev,
          error: result.error,
        }))
        return false
      }

      return true
    } catch (error) {
      console.error("Delete error:", error)
      setUploadState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown deletion error",
      }))
      return false
    }
  }, [])

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    })
  }, [])

  return {
    uploadState,
    uploadFiles,
    removeFile,
    resetUploadState,
  }
}
