# WebP Image Converter Application

Welcome to the WebP Image Converter Application built with Next.js and TypeScript. This application allows users to convert their JPG and PNG images to the WebP format using a lossless conversion method. Notably, the ICC metadata is preserved during conversion, ensuring that images with HDR or Display P3 data maintain their color accuracy and quality in the converted WebP image.

## Application Features

- **File Upload**: Users can upload images in JPG or PNG formats by dragging and dropping the file into the upload area or by clicking to select a file from their computer.
- **ICC Metadata Preservation**: The converter retains the ICC profile metadata, so features like HDR and Display P3 are preserved.
- **Lossless Conversion**: Images are converted to WebP format using a lossless method to ensure the highest quality.
- **Metadata Display**: The application displays image metadata including name, size, type, last modified date, and ICC profile if available.
- **Image Preview**: Users can preview the uploaded image before starting the conversion process.
- **Conversion to WebP**: Users can convert their uploaded images to the WebP format with a simple click.
- **Download**: Users can download the converted WebP images after the conversion is complete.

## Getting Started

To get started, install the dependencies by running:

`npm install`

Then, you can start the development server by executing:

`npm run dev`

This will start the Next.js server on localhost with the default port 3000. You can then navigate to `http://localhost:3000` in your web browser to interact with the application.

## Building for Production
To build the application for production, run:

`npm run build`

And to start the server with the production build, use:

`npm run start`

## Deploying the Application
To deploy your application, you can follow the Next.js deployment documentation [here](https://nextjs.org/docs/deployment).

Alternatively, if you are developing on Replit, you can make use of (Replit Deployments to automatically build and deploy your application to the cloud)[https://docs.replit.com/hosting/deployments/about-deployments].

Ensure your `.replit` configuration file is set up correctly to take advantage of Replit's deployment features.
Happy converting!

