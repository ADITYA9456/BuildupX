const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Define the source image path
const sourceImage = path.join(__dirname, '..', 'public', 'img', 'logo.jpg');

// Define the output directory for icons
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define the sizes for the PWA icons
const sizes = [192, 384, 512];

async function generateIcons() {
  try {
    console.log('Reading source image:', sourceImage);

    // Check if source image exists
    if (!fs.existsSync(sourceImage)) {
      console.error('Source image not found:', sourceImage);
      return;
    }

    // Load the image
    const img = sharp(sourceImage);
    
    // Get image metadata
    const metadata = await img.metadata();
    console.log('Source image size:', metadata.width, 'x', metadata.height);

    // Generate each icon size
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      console.log(`Generating ${size}x${size} icon...`);
      
      // Resize the image and maintain aspect ratio
      await img
        .resize({
          width: size,
          height: size,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 }  // Black background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Created ${outputPath}`);
    }

    console.log('\nAll PWA icons have been generated successfully!');
    console.log('PWA configuration is now complete with real icons.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation function
generateIcons();
