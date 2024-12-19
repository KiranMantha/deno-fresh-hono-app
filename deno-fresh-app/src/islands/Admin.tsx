import FileUpload from '@components/FileUpload.tsx';

export default function AdminIsland() {
  const handleFileUpload = (fileDetails: { fileName: string; fileContent: string }) => {
    console.log(fileDetails);
  };

  return (
    <div className="mx-auto mt-10 w-1/2">
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
}
