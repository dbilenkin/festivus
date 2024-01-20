import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const targetAspectRatio = 5 / 7;

// Function to crop an image
const cropImage = async (filePath, outputFolder) => {
    try {
        const metadata = await sharp(filePath).metadata();
        const { width, height } = metadata;
        let newWidth, newHeight;

        // Calculate new dimensions to maintain a 5:7 aspect ratio
        if (width / height > targetAspectRatio) {
            // Image is too wide, reduce width
            newHeight = height;
            newWidth = Math.round(height * targetAspectRatio);
        } else {
            // Image is too tall, reduce height
            newWidth = width;
            newHeight = Math.round(width / targetAspectRatio);
        }

        const filename = path.basename(filePath);
        const outputPath = path.join(outputFolder, filename);

        await sharp(filePath)
            .extract({ 
                width: newWidth, 
                height: newHeight, 
                left: Math.round((width - newWidth) / 2), // Round to nearest integer
                top: Math.round((height - newHeight) / 2)  // Round to nearest integer
            })
            .toFile(outputPath);

        console.log(`Processed ${filename}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
};

const deckType = "famousPeople";

// Main function
const processImages = async () => {
    const inputFolder = './' + deckType; // Folder containing images
    const outputFolder = './cropped_' + deckType; // Folder for cropped images

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Read all files in the input folder
    const files = fs.readdirSync(inputFolder);

    for (const file of files) {
        const filePath = path.join(inputFolder, file);
        if (fs.statSync(filePath).isFile()) {
            await cropImage(filePath, outputFolder);
        }
    }
};

// Run the script
processImages();
