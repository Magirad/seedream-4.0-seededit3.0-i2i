import os
import base64
import time
import requests
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# This function contains the logic to call the Bytedance API
def call_bytedance_api(positive_prompt, negative_prompt, api_key, image_size, watermark, model, 
                       seed, guidance_scale, sequential_gen, max_images, stream, 
                       api_endpoint, images=None):
    
    # --- Input Validations (Unchanged) ---
    if not api_endpoint: return None, "Error: API Endpoint URL must be provided."
    if not api_key: return None, "Error: API Key must be provided."
    if not positive_prompt: return None, "Error: Positive Prompt cannot be empty."
    if not model: return None, "Error: A model must be selected."

    headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }
    
    payload = {
        "model": model,
        "prompt": positive_prompt,
        "response_format": "b64_json",
        "watermark": watermark
    }

    if model == "seededit-3-0-i2i-250628":
        # This block is unchanged and correct for the 'seededit' model.
        payload["size"] = "adaptive"
        if seed is not None:
            try: payload["seed"] = int(seed)
            except (ValueError, TypeError): return None, "Error: Seed must be a valid integer."
        if guidance_scale is not None:
            try: payload["guidance_scale"] = float(guidance_scale)
            except (ValueError, TypeError): return None, "Error: Guidance Scale must be a valid number."
    
    elif model == "seedream-4-0-250828":
        # --- THIS IS THE CRITICAL UPDATE ---
        # Use the new keyword-based mapping for image size as requested.
        size_mapping = {
            "4096x4096": "4K", "4096x2304": "4K_rect", "2304x4096": "4K_rect",
            "2048x2048": "2K", "2048x1152": "2K_rect", "1152x2048": "2K_rect",
            "1024x1024": "1K", "1024x576": "1K_rect", "576x1024": "1K_rect", "512x512": "512"
        }
        api_size = size_mapping.get(image_size)
        if not api_size:
            return None, f"Error: The selected image size '{image_size}' is not valid for the {model} model."
        payload["size"] = api_size
        # --- END OF UPDATE ---
        
        payload["stream"] = stream
        payload["sequential_image_generation"] = sequential_gen

        if seed is not None:
            try: payload["seed"] = int(seed)
            except (ValueError, TypeError): return None, "Error: Seed must be a valid integer."
        if sequential_gen == "auto" and max_images is not None:
            try: payload["sequential_image_generation_options"] = {"max_images": int(max_images)}
            except (ValueError, TypeError): return None, "Error: Max Images must be a valid integer."
    else:
        return None, f"Error: Model '{model}' is not configured in the backend."

    if negative_prompt:
        payload["negative_prompt"] = negative_prompt

    if images:
        image_data_urls = [f"data:image/png;base64,{b64_string}" for b64_string in images]
        if model == "seededit-3-0-i2i-250628" and len(image_data_urls) > 0:
             payload["image"] = image_data_urls[0]
        else:
             payload["image"] = image_data_urls
    
    try:
        response = requests.post(api_endpoint, headers=headers, json=payload, timeout=180)
        response_data = response.json()
        response.raise_for_status()

        if "error" in response_data and response_data["error"]:
            error_message = response_data.get("error", {}).get("message", "An unknown error was found in the API response.")
            return None, f"Error from API: {error_message}"
        
        if "data" in response_data and response_data.get("data"):
            image_obj = response_data["data"][0]
            if "b64_json" in image_obj and image_obj["b64_json"]:
                return image_obj["b64_json"], None
            else:
                 failure_reason = image_obj.get("error", {}).get("message", "Unknown reason.")
                 return None, f"Error: Image generation failed. Reason: {failure_reason}"

        return None, "Error: Unexpected API response structure. Check terminal logs."

    except requests.exceptions.RequestException as e:
        error_details = f"Error during API call: {e}"
        if e.response is not None:
            error_details += f" | Response Body: {e.response.text}"
        return None, error_details

# The generate_image function and the rest of the file are unchanged and correct.
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.get_json()
    
    sequential_gen, max_images, stream = data.get('sequentialGen'), data.get('maxImages'), data.get('stream')
    seed, guidance_scale = data.get('seed'), data.get('guidanceScale')
    api_endpoint, positive_prompt, negative_prompt = data.get('apiEndpoint'), data.get('positivePrompt'), data.get('negativePrompt')
    api_key, image_size = data.get('apiKey'), data.get('imageSize')
    images_b64, watermark_enabled, model_selected = data.get('images', []), data.get('watermarkEnabled'), data.get('model')

    generated_image_b64, error = call_bytedance_api(
        positive_prompt, negative_prompt, api_key, image_size, watermark_enabled, 
        model_selected, seed, guidance_scale, sequential_gen, max_images, stream, 
        api_endpoint, images=images_b64
    )

    if error is None and generated_image_b64:
        try:
            if model_selected == "seedream-4-0-250828":
                target_dir = os.path.join('downloads', 'seedream4')
            elif model_selected == "seededit-3-0-i2i-250628":
                target_dir = os.path.join('downloads', 'seededit3')
            else:
                target_dir = 'downloads'

            os.makedirs(target_dir, exist_ok=True)
            filename = f"generated_{int(time.time())}.png"
            filepath = os.path.join(target_dir, filename)
            image_data = base64.b64decode(generated_image_b64)
            with open(filepath, 'wb') as f:
                f.write(image_data)
            print(f"✅ Image successfully auto-saved to: {filepath}")
        except Exception as e:
            print(f"❌ CRITICAL ERROR: Could not auto-save image. Reason: {e}")
        
        return jsonify({"image": generated_image_b64})
    else:
        return jsonify({"error": error or "An unknown error occurred on the server."})

if __name__ == '__main__':
    for directory in ['templates', 'static', 'downloads', 'downloads/seedream4', 'downloads/seededit3']:
        if not os.path.exists(directory):
            os.makedirs(directory)
    app.run(debug=True)