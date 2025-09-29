# Bytedance Image Generation GUI

A simple and modern web user interface for interacting with the Bytedance Image Generation API. This tool allows you to easily configure your API credentials, select models, and generate images using the powerful "Combine" feature, which leverages both text prompts and reference images.

The interface is built with Flask for the backend and standard HTML, CSS, and JavaScript for the frontend, providing a responsive and user-friendly experience.

## Features

- **Sleek, Modern UI**: A dark-themed, single-page interface designed for ease of use.
- **Persistent Configuration**: Your API keys, endpoints, and model IDs are saved in the browser's local storage, so you don't have to enter them every time.
- **Dynamic UI**: The interface intelligently shows and hides options based on the selected model (`seedream 4.0` vs. `seededit 03 i2i`).
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

```bash
git clone <your-repository-url>
cd <repository-folder>