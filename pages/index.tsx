import { useState, ChangeEvent, useRef, DragEvent } from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

interface FileMetadata {
  name: string;
  size: number; // Size in bytes
  type: string;
  lastModified: string;
  iccProfile?: string;
  iccProfileDescription?: string;
}

const Home: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState<boolean>(false); // Loading state for metadata
  const [webpUrl, setWebpUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] =
    useState<string>("image.webp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange({
        target: { files: event.dataTransfer.files },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return size + " bytes";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    else if (size < 1024 * 1024 * 1024)
      return (size / 1024 / 1024).toFixed(1) + " MB";
    return (size / 1024 / 1024 / 1024).toFixed(1) + "GB";
  };

  const getIccProfile = async (
    file: File,
  ): Promise<{
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
          description: jsonResponse.iccProfileDescription,
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
      setSelectedFile(file);

      const imageFile = event.target.files[0];
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl); // Save the preview URL in the state
      
      setIsMetadataLoading(true); // Start loading metadata
      const iccData = await getIccProfile(file);
      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        iccProfile: iccData.base64,
        iccProfileDescription: iccData.description,
      };
      setFileMetadata(metadata);
      setIsMetadataLoading(false); // End loading metadata
    } else {
      setSelectedFile(null);
      setFileMetadata(null);
    }
  };

  const clearSelectedFile = () => {
    // Before clearing the selected file, revoke the object URL to avoid memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setSelectedFile(null);
    setWebpUrl(null);
    setFileMetadata(null); // Clear the metadata as well
    setIsMetadataLoading(false); // Clear the metadata loading state
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput} // Add onClick event here to trigger file selection
            className={styles.uploadSection}
          >
            <div className={styles.dropZone}>
              Drag and drop your file here or click to select a file
            </div>

            <input
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={handleFileChange}
              className={styles.inputFile}
              ref={fileInputRef}
              style={{ display: "none" }} // Hide the file input, but keep it in DOM for accessibility
            />
          </div>

          {isMetadataLoading && <p>Loading metadata...</p>}

          {selectedFile && (
            <>
              <div className={styles.previewContainer}>
                {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
              </div>
              <button
                onClick={clearSelectedFile}
                className={styles.clearButton}
              >
                Clear
              </button>

              {!isMetadataLoading && fileMetadata && (
                <table className={styles.metadataTable}>
                  <tbody>
                    <tr>
                      <th>Name:</th>
                      <td>{fileMetadata.name}</td>
                    </tr>
                    <tr>
                      <th>Size:</th>
                      <td>{formatFileSize(fileMetadata.size)}</td>
                    </tr>
                    <tr>
                      <th>Type:</th>
                      <td>{fileMetadata.type}</td>
                    </tr>
                    <tr>
                      <th>Modified:</th>
                      <td>{fileMetadata.lastModified}</td>
                    </tr>
                    {fileMetadata.iccProfile && (
                      <tr>
                        <th>ICC Profile:</th>
                        <td>{fileMetadata.iccProfileDescription || "None"}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* Conditionally render the 'Convert to WebP' button */}
          {selectedFile && (
            <button
              onClick={convertToWebp}
              className={styles.convertButton}
              disabled={isLoading}
            >
              {isLoading ? "Converting..." : "Convert to WebP"}
            </button>
          )}
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
      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
