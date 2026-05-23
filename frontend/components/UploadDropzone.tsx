"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadDropzone() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: true,
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-10
          text-center cursor-pointer transition
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }
        `}
      >
        <input {...getInputProps()} />

        <p className="text-lg font-semibold">
          Drag & drop food images here
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Upload 10–30 photos from different angles
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Uploaded Images ({files.length})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="border rounded-xl overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                />

                <div className="p-2 text-xs truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}