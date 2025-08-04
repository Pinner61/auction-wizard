"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export type UploadedFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  file: File;
};

export function useFileUpload(folder: "public" | "documents" = "public") {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  // Validate supported file types (images, videos, and documents)
  const isSupportedFileType = (file: File): boolean => {
    const supportedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const supportedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]; // Add more as needed
const supportedDocumentTypes = [
  // Text & Word Processing
  "application/pdf",                                           // .pdf
  "application/msword",                                        // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/rtf",                                           // .rtf
  "text/plain",                                                // .txt
  "application/vnd.oasis.opendocument.text",                   // .odt

  // Spreadsheets
  "application/vnd.ms-excel",                                  // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",                                                  // .csv
  "application/vnd.oasis.opendocument.spreadsheet",            // .ods

  // Presentations
  "application/vnd.ms-powerpoint",                             // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.oasis.opendocument.presentation",           // .odp

  // Markup & Code
  "application/json",                                          // .json
  "application/xml",                                           // .xml
  "text/html",                                                 // .html, .htm
  "text/css",                                                  // .css
  "application/javascript",                                    // .js
];

    return [
      ...supportedImageTypes,
      ...supportedVideoTypes,
      ...supportedDocumentTypes,
    ].includes(file.type);
  };

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      if (!files.length) return [];

      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
      });

      const uploadedFiles: UploadedFile[] = [];
      const totalFiles = files.length;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!isSupportedFileType(file)) {
            throw new Error(
              `Unsupported file type: ${file.name}. Use JPEG, PNG, GIF, MP4, WebM, MOV, PDF, DOC, DOCX, TXT, XLS, or XLSX.`
            );
          }

          setUploadState((prev) => ({
            ...prev,
            progress: Math.round((i / totalFiles) * 100),
          }));

          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${folder}/${fileName}`;
          const { data, error } = await supabase.storage
            .from("auctions")
            .upload(filePath, file, {
              upsert: true,
            });

          if (error) {
            throw new Error(`Error uploading ${file.name}: ${error.message}`);
          }

          const { data: urlData } = supabase.storage.from("auctions").getPublicUrl(filePath);

          uploadedFiles.push({
            id: data.path,
            name: file.name,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            file,
          });
        }

        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
        });

        return uploadedFiles;
      } catch (error) {
        console.error("Upload error:", error);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error instanceof Error ? error.message : "Unknown upload error",
        }));
        return uploadedFiles;
      }
    },
    [folder]
  );

  const removeFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        const { error } = await supabase.storage.from("auctions").remove([fileId]);
        if (error) {
          throw new Error(error.message);
        }
        return true;
      } catch (error) {
        console.error("Delete error:", error);
        setUploadState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown deletion error",
        }));
        return false;
      }
    },
    []
  );

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    uploadState,
    uploadFiles,
    removeFile,
    resetUploadState,
  };
}

// Corrected handler using the hook's uploadFiles function
export const handleImagesOrVideosUploaded = async (
  newFiles: UploadedFile[],
  uploadFilesFn: (files: File[]) => Promise<UploadedFile[]>
) => {
  console.log("New files:", newFiles); // Debug
  const files = newFiles.map((file) => file.file as unknown as File); // Safer cast via unknown
  const uploadedFiles = await uploadFilesFn(files);
  return uploadedFiles.map((file) => ({
    ...file,
    url: file.url || "", // Ensure url is a string
  }) as const); // Type assertion to enforce UploadedFile shape
};
