import { useState } from 'react'
import axios from 'axios'
import { ExtractedData } from './types';
import './App.css'

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [response, setResponse] = useState<ExtractedData | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a document.");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await axios.post<{ extractedData: ExtractedData }>(
        "http://localhost:3000/api/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResponse(res.data.extractedData);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Error processing document.");
    }
  };

  return (
    <div className="container">
      <h1>Document Upload</h1>
      <form onSubmit={handleSubmit}>
        <label className="label-file" htmlFor="file-upload">
          Choose a Document
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {fileName && <p className="file-name">Selected File: {fileName}</p>}
        <button type="submit">Upload Document</button>
      </form>

      {response && (
        <div>
          <h2>Extracted Information</h2>
          <p><strong>Name:</strong> {response.name}</p>
          <p><strong>Document Number:</strong> {response.documentNumber}</p>
          <p><strong>Issue Date:</strong> {response.issueDate}</p>
          <p><strong>Expiration Date:</strong> {response.expirationDate}</p>
        </div>
      )}
    </div>
  )
}

export default App
