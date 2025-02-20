

// visionAPI.js
// visionAPI.js
import axios from 'axios';

const API_KEY = 'AIzaSyB-Xh0sUpzK-z738W7lIV4YKopwisRZoWU';
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

export const analyzeImage = async (base64) => {
  try {
    const response = await axios.post(VISION_API_URL, {
      requests: [
        {
          image: {
            content: base64,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5,
            },
            {
              type: 'IMAGE_PROPERTIES',
              maxResults: 5,
            },
          ],
        },
      ],
    });

    const labels = response.data.responses[0].labelAnnotations.map((label) => label.description);

    // 🔥 Extract Dominant Colors
    const colors = response.data.responses[0].imagePropertiesAnnotation.dominantColors.colors.map((color) => {
      return {
        rgb: `rgb(${Math.round(color.color.red)}, ${Math.round(color.color.green)}, ${Math.round(color.color.blue)})`,
        score: color.score,
      };
    });

    return { labels, colors };
  } catch (error) {
    console.error("🔥 Vision API Error:", error);
    return { labels: [], colors: [] };
  }
};

