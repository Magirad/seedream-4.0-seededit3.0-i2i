document.addEventListener('DOMContentLoaded', function() {
    // --- Central store and element references ---
    const fileStore = { combine: [] };
    const infoLog = document.getElementById('live-info-log');

    // API Key Elements
    const apiKeySelect = document.getElementById('api-key-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const removeKeyBtn = document.getElementById('remove-key-btn');
    const defaultApiKeys = ["YOUR_API_KEY_HERE"];

    // API Endpoint Elements
    const apiEndpointSelect = document.getElementById('api-endpoint-select');
    const apiEndpointInput = document.getElementById('api-endpoint-input');
    const saveEndpointBtn = document.getElementById('save-endpoint-btn');
    const removeEndpointBtn = document.getElementById('remove-endpoint-btn');
    const defaultApiEndpoints = ["https://ark.ap-southeast.bytepluses.com/api/v3/images/generations"];

    // Model ID Elements
    const modelIdSelect = document.getElementById('model-id-select');
    const modelIdInput = document.getElementById('model-id-input');
    const saveModelBtn = document.getElementById('save-model-btn');
    const removeModelBtn = document.getElementById('remove-model-btn');
    const defaultModels = ["seedream-4-0-250828", "seededit-3-0-i2i-250628"];

    // Model-specific size options
    const seedreamSizes = ["4096x4096", "4096x2304", "2304x4096", "2048x2048", "2048x1152", "1152x2048", "1024x1024", "1024x576", "576x1024", "512x512"];
    const seededitSizes = ["adaptive"];

    // --- Helper Functions ---
    function logInfo(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const p = document.createElement('p');
        p.className = `log-${type}`;
        p.textContent = `[${timestamp}] ${message}`;
        infoLog.appendChild(p);
        infoLog.scrollTop = infoLog.scrollHeight;
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    // --- UI Rendering Functions ---
    function displayReferenceImages(tabName) {
        const container = document.getElementById(`${tabName}-reference-container`);
        if (!container) return;
        
        container.innerHTML = ''; 

        fileStore[tabName].forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'thumb-wrapper';
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'thumb';
                const removeBtn = document.createElement('span');
                removeBtn.className = 'remove-thumb';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = () => {
                    fileStore[tabName].splice(index, 1);
                    displayReferenceImages(tabName);
                };
                wrapper.appendChild(img);
                wrapper.appendChild(removeBtn);
                container.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });

        const selectedModel = modelIdSelect.value;
        const limit = (selectedModel === "seededit-3-0-i2i-250628") ? 1 : 10;
        
        if (fileStore[tabName].length < limit) {
            const uploadLabel = document.createElement('label');
            uploadLabel.className = 'upload-area';
            uploadLabel.setAttribute('for', `${tabName}-images`);
            uploadLabel.innerHTML = `<div class="upload-icon">↑</div><div>Click or drag file</div>`;
            container.appendChild(uploadLabel);
        }
    }

    // --- Local Storage Management ---
    function loadAndPopulateDropdown(dropdownElement, localStorageKey, defaultValues) {
        let items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        if (items.length === 0) {
            items = defaultValues;
            localStorage.setItem(localStorageKey, JSON.stringify(items));
        }
        dropdownElement.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdownElement.appendChild(option);
        });
        const selectedItem = localStorage.getItem(`selected-${localStorageKey}`);
        if (selectedItem && items.includes(selectedItem)) {
            dropdownElement.value = selectedItem;
        } else if (items.length > 0) {
            dropdownElement.value = items[0];
            localStorage.setItem(`selected-${localStorageKey}`, items[0]);
        }
    }

    function saveItem(dropdownElement, localStorageKey, inputElement) {
        const newItem = inputElement.value.trim();
        if (!newItem) {
            alert("Input field cannot be empty.");
            return;
        }
        let items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        if (!items.includes(newItem)) {
            items.push(newItem);
            localStorage.setItem(localStorageKey, JSON.stringify(items));
            localStorage.setItem(`selected-${localStorageKey}`, newItem);
            loadAndPopulateDropdown(dropdownElement, localStorageKey, []);
            dropdownElement.value = newItem;
            logInfo(`Saved new ${localStorageKey.replace(/s$/, '')}: ${newItem}`, "success");
        } else {
            alert("This item already exists.");
        }
        inputElement.value = '';
    }

    function removeItem(dropdownElement, localStorageKey) {
        const itemToRemove = dropdownElement.value;
        if (!itemToRemove) {
            alert("No item selected to remove.");
            return;
        }
        let items = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        items = items.filter(item => item !== itemToRemove);
        localStorage.setItem(localStorageKey, JSON.stringify(items));
        localStorage.removeItem(`selected-${localStorageKey}`);
        loadAndPopulateDropdown(dropdownElement, localStorageKey, []);
        logInfo(`Removed ${localStorageKey.replace(/s$/, '')}: ${itemToRemove}`, "warn");
        alert("Item removed!");
    }

    // --- UI Toggling Function ---
    function toggleAdvancedOptions() {
        const selectedModel = modelIdSelect.value;
        const allSharedSeedOptions = document.querySelectorAll('.shared-seed-option');
        const allSeedEditOptions = document.querySelectorAll('.seededit-specific-options');
        const allSeedreamOptions = document.querySelectorAll('.seedream-options');
        const allSizeSelectors = document.querySelectorAll('.image-size-selector');
        const allFileInputs = document.querySelectorAll('input[type="file"]');

        allSharedSeedOptions.forEach(el => el.style.display = 'block');
        allSeedEditOptions.forEach(el => el.style.display = 'none');
        allSeedreamOptions.forEach(el => el.style.display = 'none');

        if (selectedModel === "seededit-3-0-i2i-250628") {
            allSeedEditOptions.forEach(el => el.style.display = 'block');
            allFileInputs.forEach(input => input.removeAttribute('multiple'));
            allSizeSelectors.forEach(selector => {
                selector.innerHTML = '';
                seededitSizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = size;
                    selector.appendChild(option);
                });
            });
            if (fileStore.combine.length > 1) {
                fileStore.combine = [fileStore.combine[0]];
            }
        } else {
            allSeedreamOptions.forEach(el => el.style.display = 'block');
            allFileInputs.forEach(input => input.setAttribute('multiple', 'true'));
            allSizeSelectors.forEach(selector => {
                selector.innerHTML = '';
                seedreamSizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size;
                    option.textContent = size;
                    selector.appendChild(option);
                });
                selector.value = "2048x2048";
            });
        }
        displayReferenceImages('combine');
    }

    // --- Main Submission Handler ---
    async function handleFormSubmit(event, tabName) {
        event.preventDefault(); 
        const resultContainer = document.getElementById(`${tabName}-result`);
        const downloadContainer = document.getElementById(`${tabName}-download-container`);
        infoLog.innerHTML = '';
        resultContainer.innerHTML = `<div class="placeholder-text">Processing...</div>`;
        downloadContainer.innerHTML = '';
        logInfo('Process started...');

        const apiKey = apiKeySelect.value;
        const apiEndpoint = apiEndpointSelect.value;
        const model = modelIdSelect.value;
        
        if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || !apiEndpoint || !model) {
            const errorMessage = "API Key, Endpoint, and Model must be configured and selected.";
            logInfo(errorMessage, 'error');
            resultContainer.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            return;
        }

        const form = document.getElementById(`${tabName}-form`);
        const positivePrompt = form.querySelector('.positive-prompt').value;
        const negativePrompt = form.querySelector('.negative-prompt').value;
        const imageSize = form.querySelector('.image-size-selector').value;
        const watermarkEnabled = form.querySelector('.watermark-checkbox').checked;
        const seed = form.querySelector('.seed-input')?.value;
        const guidanceScale = form.querySelector('.guidance-input')?.value;
        const sequentialGen = form.querySelector('.sequential-gen-select')?.value;
        const maxImages = form.querySelector('.max-images-input')?.value;
        const stream = form.querySelector('.stream-checkbox')?.checked;
        
        const imagesB64 = await Promise.all(
            fileStore[tabName].map(file => getBase64(file))
        );

        logInfo("--- Request Details ---");
        logInfo(`API Endpoint: ${apiEndpoint}`);
        logInfo(`Model: ${model}`);
        logInfo(`API Key: ...${apiKey.slice(-4)}`);
        logInfo(`Positive Prompt: "${positivePrompt}"`);
        logInfo(`Negative Prompt: "${negativePrompt || 'None'}"`);
        logInfo(`Image Size: ${imageSize}`);
        if (model === 'seededit-3-0-i2i-250628') {
            logInfo(`Seed: ${seed}`);
            logInfo(`Guidance Scale: ${guidanceScale}`);
        } else {
            logInfo(`Batch Generation: ${sequentialGen}`);
            if (sequentialGen === 'auto') {
                logInfo(`Max Images: ${maxImages}`);
            }
            logInfo(`Stream Enabled: ${stream}`);
        }
        logInfo(`Watermark Enabled: ${watermarkEnabled}`);
        logInfo(`Reference Images: ${imagesB64.length}`);
        logInfo("-----------------------");

        resultContainer.innerHTML = '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>';
        logInfo('Sending request to Bytedance API...', 'info');

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiEndpoint: apiEndpoint,
                    positivePrompt: positivePrompt,
                    negativePrompt: negativePrompt,
                    apiKey: apiKey,
                    imageSize: imageSize,
                    watermarkEnabled: watermarkEnabled,
                    model: model,
                    seed: seed,
                    guidanceScale: guidanceScale,
                    sequentialGen: sequentialGen,
                    maxImages: maxImages,
                    stream: stream,
                    images: imagesB64
                })
            });
            
            const data = await response.json();

            if (data.error) {
                logInfo(`Request failed: ${data.error}`, 'error');
                resultContainer.innerHTML = `<div class="alert alert-danger" style="white-space: pre-wrap;">${data.error}</div>`;
            } else if (data.image && data.image.length > 100) {
                logInfo('Image data received. Rendering image...', 'success');
                const imageUrl = `data:image/jpeg;base64,${data.image}`;
                resultContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
                const downloadButton = document.createElement('a');
                downloadButton.href = imageUrl;
                downloadButton.download = `generated_${Date.now()}.jpg`;
                downloadButton.className = 'btn btn-success';
                downloadButton.textContent = 'Download Image';
                downloadContainer.appendChild(downloadButton);
                logInfo("Image generation successful! File auto-saved to the server's 'downloads' folder.", 'success');
            } else {
                const errorMessage = "Error: Server did not return valid image data. Check terminal and console logs for details.";
                logInfo(errorMessage, 'error');
                resultContainer.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
            }
        } catch (error) {
            logInfo(`A critical network error occurred: ${error.message}`, 'error');
            resultContainer.innerHTML = `<div class="alert alert-danger">A network error occurred. Check the live log and console.</div>`;
        }
    }
    
    function setupEventListenersForTab(tabName) {
        const form = document.getElementById(`${tabName}-form`);
        const fileInput = document.getElementById(`${tabName}-images`);
        const referenceContainer = document.getElementById(`${tabName}-reference-container`);
        const clearBtn = document.querySelector(`.clear-images-btn[data-tab="${tabName}"]`);
        
        const sequentialGenSelect = form.querySelector('.sequential-gen-select');
        const maxImagesContainer = form.querySelector('.max-images-container');
        const maxImagesInput = form.querySelector('.max-images-input');
        const maxImagesValue = form.querySelector('.max-images-value');

        if (form) {
            form.addEventListener('submit', (e) => handleFormSubmit(e, tabName));
        }

        const handleFiles = (files) => {
            const selectedModel = modelIdSelect.value;
            const limit = (selectedModel === "seededit-3-0-i2i-250628") ? 1 : 10;
            const currentCount = fileStore[tabName].length;
            const canAdd = limit - currentCount;
            const newFiles = Array.from(files).slice(0, canAdd);
            
            if (modelIdSelect.value === "seededit-3-0-i2i-250628") {
                fileStore[tabName] = newFiles.length > 0 ? [newFiles[0]] : [];
            } else {
                newFiles.forEach(file => fileStore[tabName].push(file));
            }
            displayReferenceImages(tabName);
        };

        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                handleFiles(event.target.files);
                fileInput.value = ''; 
            });
        }

        if (referenceContainer) {
            referenceContainer.addEventListener('dragover', (event) => {
                event.preventDefault();
                const uploadArea = referenceContainer.querySelector('.upload-area');
                if (uploadArea) uploadArea.classList.add('dragover');
            });
            referenceContainer.addEventListener('dragleave', () => {
                const uploadArea = referenceContainer.querySelector('.upload-area');
                if (uploadArea) uploadArea.classList.remove('dragover');
            });
            referenceContainer.addEventListener('drop', (event) => {
                event.preventDefault();
                const uploadArea = referenceContainer.querySelector('.upload-area');
                if (uploadArea) uploadArea.classList.remove('dragover');
                if (event.dataTransfer.files) {
                    handleFiles(event.dataTransfer.files);
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                fileStore[tabName] = [];
                displayReferenceImages(tabName);
                if(fileInput) fileInput.value = ''; 
            });
        }
        
        if(sequentialGenSelect && maxImagesContainer) {
            sequentialGenSelect.addEventListener('change', () => {
                maxImagesContainer.style.display = sequentialGenSelect.value === 'auto' ? 'block' : 'none';
            });
        }
        if(maxImagesInput && maxImagesValue){
            maxImagesInput.addEventListener('input', () => {
                maxImagesValue.textContent = maxImagesInput.value;
            });
        }
    }

    // --- INITIALIZATION ---
    loadAndPopulateDropdown(apiKeySelect, 'apiKeys', defaultApiKeys);
    loadAndPopulateDropdown(apiEndpointSelect, 'apiEndpoints', defaultApiEndpoints);
    loadAndPopulateDropdown(modelIdSelect, 'modelIds', defaultModels);

    // Setup event listeners for config management
    saveKeyBtn.addEventListener('click', () => saveItem(apiKeySelect, 'apiKeys', apiKeyInput));
    removeKeyBtn.addEventListener('click', () => removeItem(apiKeySelect, 'apiKeys'));
    apiKeySelect.addEventListener('change', () => localStorage.setItem('selected-apiKeys', apiKeySelect.value));

    saveEndpointBtn.addEventListener('click', () => saveItem(apiEndpointSelect, 'apiEndpoints', apiEndpointInput));
    removeEndpointBtn.addEventListener('click', () => removeItem(apiEndpointSelect, 'apiEndpoints'));
    apiEndpointSelect.addEventListener('change', () => localStorage.setItem('selected-apiEndpoints', apiEndpointSelect.value));

    saveModelBtn.addEventListener('click', () => saveItem(modelIdSelect, 'modelIds', modelIdInput));
    removeModelBtn.addEventListener('click', () => {
        removeItem(modelIdSelect, 'modelIds');
        toggleAdvancedOptions();
    });
    modelIdSelect.addEventListener('change', () => {
        localStorage.setItem('selected-modelIds', modelIdSelect.value);
        toggleAdvancedOptions();
    });

    // Initialize the main tab's event listeners.
    setupEventListenersForTab('combine');

    // Set initial UI state based on the loaded model.
    toggleAdvancedOptions(); 
});