import FileUpload from '@components/FileUpload.tsx';

export default function AdminIsland() {
  const handleFileUpload = async (fileDetails: { fileName: string; fileContent: string }) => {
    console.log(fileDetails);
    const response = await fetch('http://localhost:5000/upload-isolate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fileDetails)
    });

    const responseData: { message: string; error: string } = await response.json();

    if (responseData.message) {
      alert(responseData.message);
    } else {
      alert(`Error: ${responseData.error}`);
    }
  };

  return (
    <div className="mx-auto mt-10 w-1/2">
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
}
