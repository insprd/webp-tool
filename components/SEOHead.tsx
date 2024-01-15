import Head from "next/head";

const SEOHead = () => {
  return (
    <Head>
      <title>WebP Image Converter - Convert JPG/PNG to WebP Online</title>
      <meta
        name="description"
        content="WebP Image Converter - convert JPG and PNG images to WebP format while preserving ICC metadata for color accuracy."
      />
      <meta
        name="keywords"
        content="WebP, image converter, JPG to WebP, PNG to WebP, ICC metadata preservation, lossless conversion"
      />
      <meta property="og:title" content="WebP Image Converter" />
      <meta
        property="og:description"
        content="Convert JPG and PNG images to WebP format online while preserving ICC metadata for high-quality results."
      />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/path-to-social-media-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="WebP Image Converter" />
      <meta
        name="twitter:description"
        content="Easily convert your images to WebP format with ICC metadata preservation for quality and accuracy."
      />
      <meta name="twitter:image" content="/path-to-social-media-image.jpg" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEOHead;
