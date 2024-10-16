// backend/utils/imageGenerator.js

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a set of colors to choose from
const COLORS = ['#52b2cf', '#7ec4cf', '#9cadce', '#d1cfe2', '#d4afb9', '#db6f91'];

/**
 * Generates a default profile image with the first letter of the user's name and a random background color.
 * @param {string} name - The user's name.
 * @returns {Promise<string>} - The relative path to the saved profile image.
 */
const generateProfileImage = async (name) => {
  try {
    // Extract the first letter and convert it to uppercase
    const firstLetter = name.charAt(0).toUpperCase();

    // Select a random color from the COLORS array
    const backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Define image dimensions
    const width = 200; // Width of the image
    const height = 200; // Height of the image

    // Create a canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill the background with the selected color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set text properties
    ctx.fillStyle = '#FFFFFF'; // Text color
    ctx.font = 'bold 100px Arial'; // Font size and family
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the first letter
    ctx.fillText(firstLetter, width / 2, height / 2);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Define the uploads directory and profileImages subdirectory
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'profileImages');

    // Ensure the directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

    // Define the full path to save the image
    const filePath = path.join(uploadsDir, filename);

    // Save the image to the filesystem
    fs.writeFileSync(filePath, buffer);

    // Return the relative path to be stored in the database
    return `uploads/profileImages/${filename}`;
  } catch (error) {
    console.error('Error generating profile image:', error);
    throw new Error('Failed to generate profile image');
  }
};




export default generateProfileImage;
