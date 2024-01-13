import { useState, ChangeEvent, useRef } from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: string;
  iccProfile?: string;
  iccProfileDescription?: string;
}

const Home: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [webpUrl, setWebpUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] =
    useState<string>("image.webp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getIccProfile = async (file: File): Promise<{
    base64: string | undefined;
    description: string | undefined;
  }> => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/read-icc", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const jsonResponse = await res.json();
        return {
          base64: jsonResponse.iccProfileBase64,
          description: jsonResponse.iccProfileDescription
        };
      }
    } catch (error) {
      console.error("Failed to read ICC Profile:", error);
    }
    return { base64: undefined, description: undefined };
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const iccData = await getIccProfile(file);
      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        iccProfile: iccData.base64,
        iccProfileDescription: iccData.description
      };
      setSelectedFile(file);
      setFileMetadata(metadata);
    } else {
      setSelectedFile(null);
      setFileMetadata(null);
    }
  };
  

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setWebpUrl(null);
    setFileMetadata(null); // Clear the metadata as well
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const convertToWebp = async () => {
    if (selectedFile) {
      setIsLoading(true); // start loading
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const response = await fetch("/api/convert-to-webp", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setWebpUrl(url);
          const fileBaseName = selectedFile.name
            .split(".")
            .slice(0, -1)
            .join(".");
          setDownloadFileName(`${fileBaseName}.webp`);
        } else {
          // Improved error logging
          console.error("Conversion failed: ", await response.text());
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  // Render method
  return (
    <div className={styles.container}>
      <Head>
        <title>Image Converter</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Lossless webp converter</h1>
        <div className={styles.uploadSection}>
          <input
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={handleFileChange}
            className={styles.inputFile}
            ref={fileInputRef}
          />

          {selectedFile && (
      <>
            <button onClick={clearSelectedFile} className={styles.clearButton}>
              Clear
            </button>

        {/* Table displaying file metadata */}
          <table className={styles.metadataTable}>
            <tbody>
              <tr>
                <th>Name:</th>
                <td>{fileMetadata?.name}</td>
              </tr>
              <tr>
                <th>Size:</th>
                <td>{fileMetadata?.size} bytes</td>
              </tr>
              <tr>
                <th>Type:</th>
                <td>{fileMetadata?.type}</td>
              </tr>
              <tr>
                <th>Last Modified:</th>
                <td>{fileMetadata?.lastModified}</td>
              </tr>
              <tr>
                <th>ICC Profile:</th>
                <td>{fileMetadata?.iccProfile ? 'Available' : 'None'}</td>
              </tr>
              <tr>
                <th>ICC Profile Description:</th>
                <td>{fileMetadata?.iccProfileDescription || 'None'}</td>
              </tr>
            </tbody>
          </table>
        </>
          )}

          <button onClick={convertToWebp} className={styles.convertButton} disabled={isLoading}>
            {isLoading ? 'Converting...' : 'Convert to WebP'}
          </button>
        </div>
        {webpUrl && (
          <div className={styles.downloadSection}>
            <a
              href={webpUrl}
              download={downloadFileName}
              className={styles.downloadLink}
            >
              Download converted image
            </a>
          </div>
        )}
      </main>
      <footer className={styles.footer}>Matt Legrand</footer>
    </div>
  );
};

export default Home;
