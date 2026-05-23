import UploadDropzone from "@/components/UploadDropzone";

export default function UploadPage() {
  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-10">
        Upload Dish Images
      </h1>

      <UploadDropzone />
    </main>
  );
}