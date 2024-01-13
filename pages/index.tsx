import { useState, ChangeEvent, useRef } from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [webpUrl, setWebpUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] =
    useState<string>("image.webp");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New function to clear the selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setWebpUrl(null); // Also clear the webp URL if it was set

    // Reset the input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertToWebp = async () => {
    if (selectedFile) {
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
            <button onClick={clearSelectedFile} className={styles.clearButton}>
              Clear
            </button>
          )}

          <button onClick={convertToWebp} className={styles.convertButton}>
            Convert to WebP
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
