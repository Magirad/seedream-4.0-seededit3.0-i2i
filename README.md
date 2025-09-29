A simple and modern web user interface for interacting with the Bytedance Image Generation API. This tool allows you to easily configure your API credentials, select models, and generate images using the powerful "Combine" feature, which leverages both text prompts and reference images.

The interface is built with Flask for the backend and standard HTML, CSS, and JavaScript for the frontend, providing a responsive and user-friendly experience.

## Features

- **Sleek, Modern UI**: A dark-themed, single-page interface designed for ease of use.
- **Persistent Configuration**: Your API keys, endpoints, and model IDs are saved in the browser's local storage, so you don't have to enter them every time.
- **Dynamic UI**: The interface intelligently shows and hides options based on the selected model (`seedream` vs. `seededit`).
- **Image Uploads**: Supports drag-and-drop and click-to-upload for reference images.
- **Live Logging**: A real-time log panel shows the status of your API requests, from submission to success or failure.
- **Auto-Save**: Generated images are automatically saved to a `downloads` folder on the server for your convenience.
- **Front-End Validations**: Basic checks are in place to ensure you have configured the API before making a request.

## Setup and Installation

Follow these steps to get the application running on your local machine.

#### 1. Prerequisites

- Python 3.6 or newer
- `pip` (Python package installer)

#### 2. Clone the Repository

If you have the project files, you can skip this step. Otherwise, clone the repository to your local machine:

git clone https://github.com/Magirad/seedream-4.0-seededit3.0-i2i


Open your web browser and navigate to http://127.0.0.1:5000 to use the application.
How to Use the Application
API & Model Configuration:
The first time you open the app, it will be pre-filled with default values.
Enter your Bytedance API Key in the input field and click "Save New". It will be added to the dropdown and automatically selected.
Your saved keys, endpoints, and models will be remembered for future sessions.
You can add multiple keys or endpoints and switch between them using the dropdowns.



##Image Generation ("Combine" tab):
Positive Prompt: Describe the image you want to create. Be descriptive about how the reference images should be used.
Negative Prompt: (Optional) Describe what you want to avoid in the final image (e.g., "blurry, text, watermark").
Reference Images: Drag and drop image files onto the upload area or click it to open a file dialog. The number of allowed images changes based on the selected model.
Model-Specific Options: Depending on the model you select (e.g., seedream or seededit), different options like "Guidance Scale" or "Batch Generation" will appear.
Image Size: Select the desired output resolution from the dropdown.
Combine: Click the "Combine" button to start the generation process.

##Monitor Progress:
The Live Log at the bottom will show the request details and progress.
The Output panel on the right will show a loading spinner while processing and will display the final image upon success.
If an error occurs, a detailed message will be shown in both the log and the output panel.


##Download Your Image:
A "Download Image" button will appear below the generated image.
The image is also automatically saved on the server inside the downloads/seedream4 or downloads/seededit3 directory.


##File Structure

The project is organized into the following files and directories:

.
├── app.py              
├── requirements.txt    
├── README.md           
├── static/
│   ├── script.js       
│   └── style.css       
└── templates/
    └── index.html 
