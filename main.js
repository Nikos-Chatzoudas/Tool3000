import './style.css';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Tesseract from 'tesseract.js';

const fileInput = document.getElementById('fileInput');
const convertButton = document.getElementById('convertButton');
const resizeButton = document.getElementById('resizeButton');
const extractButton = document.getElementById('extract');
const copyButton = document.getElementById('copy');
const copyIcon = copyButton.querySelector('i');
const status = document.getElementById('status');
const dropArea = document.getElementById('dropArea');
const outputFormat = document.getElementById('outputFormat');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const preserveAspectRatio = document.getElementById('preserveAspectRatio');

const supportedFormats = {
  'image': {
    'jpg': ['png', 'webp', 'gif', 'jiji'],
    'jpeg': ['png', 'webp', 'gif', 'jiji'],
    'png': ['jpg', 'webp', 'gif', 'jiji'],
    'gif': ['jpg', 'png', 'webp', 'jiji'],
    'webp': ['jpg', 'png', 'gif', 'jiji'],
    'jiji': ['jpg', 'png', 'gif', 'webp']
  },
  'font': {
    'ttf': ['woff', 'woff2', 'otf'],
    'otf': ['ttf', 'woff', 'woff2'],
    'woff': ['ttf', 'otf', 'woff2'],
    'woff2': ['ttf', 'otf', 'woff']
  },
  'document': {
    'docx': ['pdf'],
    'doc': ['pdf'],
    'txt': ['pdf'],
    'rtf': ['pdf']
  }
};

let extractedText = '';

function init() {
  setupEventListeners();
  setupPasteListener();
}

function setupPasteListener() {
  document.addEventListener('paste', handlePaste);
}

function handlePaste(e) {
  console.log('Paste event triggered');
  e.preventDefault();
  e.stopPropagation();

  const items = e.clipboardData.items;
  console.log('Clipboard items:', items);

  for (let i = 0; i < items.length; i++) {
    console.log(`Item ${i} type:`, items[i].type);
    if (items[i].type.indexOf('image') !== -1) {
      console.log('Image found in clipboard');
      const blob = items[i].getAsFile();
      const file = new File([blob], "pasted_image.png", { type: blob.type });
      console.log('Created file:', file);
      handleFiles([file]);
      return;
    }
  }

  console.log('No image found in clipboard');
  updateStatus('No image found in clipboard. Please copy an image and try again.');
}

function setupEventListeners() {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);

  dropArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  convertButton.addEventListener('click', handleConvertButtonClick);
  resizeButton.addEventListener('click', handleResizeButtonClick);
  preserveAspectRatio.addEventListener('change', handleAspectRatioChange);
  widthInput.addEventListener('input', handleDimensionInput);
  heightInput.addEventListener('input', handleDimensionInput);
  extractButton.addEventListener('click', handleExtractButtonClick);
  copyButton.addEventListener('click', handleCopyButtonClick);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFiles(files) {
  console.log('handleFiles called with:', files);
  if (files.length === 0) {
    updateStatus("No files selected.");
    return;
  }

  if (files.length > 50) {
    updateStatus("Maximum of 50 files can be selected.");
    return;
  }

  const fileType = getFileType(files[0]);
  console.log('File type:', fileType);
  if (!fileType) {
    updateStatus("Unsupported file type.");
    return;
  }

  // Create a new FileList-like object
  const dataTransfer = new DataTransfer();
  for (let i = 0; i < files.length; i++) {
    dataTransfer.items.add(files[i]);
  }
  fileInput.files = dataTransfer.files;

  updateStatus(`${files.length} file(s) selected.`);
  populateConversionOptions(fileType, files[0].name.split('.').pop().toLowerCase());
  resetCopyIconColor();
  extractedText = '';
}

function getFileType(file) {
  console.log('getFileType called with:', file);
  const extension = file.name.split('.').pop().toLowerCase();
  for (const [type, formats] of Object.entries(supportedFormats)) {
    if (formats[extension]) return type;
  }
  // If the file doesn't have a recognized extension, check its MIME type
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'document';
  return null;
}

function populateConversionOptions(fileType, extension) {
  outputFormat.innerHTML = '<option value="">Select option</option>';

  if (supportedFormats[fileType] && supportedFormats[fileType][extension]) {
    supportedFormats[fileType][extension].forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      outputFormat.appendChild(option);
    });
  } else {
    updateStatus("Unsupported file type for conversion.");
  }
}

function handleConvertButtonClick() {
  const files = fileInput.files;
  const targetFormat = outputFormat.value;

  if (files.length === 0 || !targetFormat) {
    updateStatus('Please select file(s) and a conversion format.');
    return;
  }

  updateStatus('Converting...');
  convertFiles(files, targetFormat)
    .then(() => {
      updateStatus('Conversion complete! Downloads started.');
    })
    .catch(error => {
      updateStatus(`Conversion failed: ${error.message}`);
    });
}

async function handleExtractButtonClick() {
  const files = fileInput.files;

  if (files.length === 0) {
    updateStatus('Please select an image file first.');
    return;
  }

  const file = files[0];
  if (getFileType(file) !== 'image') {
    updateStatus('Please select an image file for text extraction.');
    return;
  }

  updateStatus('Extracting text from image...');
  try {
    extractedText = await extractTextFromImage(file);
    updateStatus('Text extracted successfully. Click "Copy" to copy the text.');
    copyIcon.classList.add('text-green-500');
  } catch (error) {
    updateStatus(`Error extracting text: ${error.message}`);
    copyIcon.classList.remove('text-green-500');
  }
}

async function extractTextFromImage(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'grc+eng', {
    logger: m => {
      if (m.status === 'recognizing text') {
        updateStatus(`Recognizing text: ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  return text;
}

function handleCopyButtonClick() {
  if (extractedText) {
    navigator.clipboard.writeText(extractedText)
      .then(() => {
        updateStatus('Text copied to clipboard!');
        setTimeout(() => copyIcon.classList.remove('text-green-500'), 1000);
      })
      .catch(err => updateStatus(`Error copying text: ${err}`));
  } else {
    updateStatus('No extracted text to copy. Please extract text from an image first.');
    copyIcon.classList.remove('text-green-500');
  }
}

function resetCopyIconColor() {
  copyIcon.classList.remove('text-green-500', 'text-blue-500');
}

async function convertFiles(files, targetFormat) {
  for (const file of files) {
    if (getFileType(file) === 'document' && targetFormat === 'pdf') {
      await convertDocumentToPdf(file);
    } else {
      await convertFile(file, targetFormat);
    }
  }
}

async function convertDocumentToPdf(file) {
  const reader = new FileReader();
  reader.onload = async (event) => {
    const content = event.target.result;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const lines = content.split('\n');
    let y = height - 50;

    for (const line of lines) {
      if (y < 50) {
        page = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = file.name.replace(/\.[^/.]+$/, '.pdf');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);
  };
  reader.readAsText(file);
}

async function convertFile(file, targetFormat) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const convertedBlob = new Blob([file], { type: `application/${targetFormat}` });

  const downloadUrl = URL.createObjectURL(convertedBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
}

function handleResizeButtonClick() {
  const files = fileInput.files;
  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);

  if (files.length === 0 || (!width && !height)) {
    updateStatus('Please select file(s) and specify at least one dimension for resizing.');
    return;
  }

  updateStatus('Resizing...');
  resizeFiles(files, width, height)
    .then(() => {
      updateStatus('Resizing complete! Downloads started.');
    })
    .catch(error => {
      updateStatus(`Resizing failed: ${error.message}`);
    });
}

async function resizeFiles(files, width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  for (const file of files) {
    await resizeFile(file, width, height, canvas, ctx);
  }
}

async function resizeFile(file, width, height, canvas, ctx) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let newWidth, newHeight;

      if (preserveAspectRatio.checked) {
        if (width) {
          newWidth = width;
          newHeight = (img.height / img.width) * width;
        } else {
          newHeight = height;
          newWidth = (img.width / img.height) * height;
        }
      } else {
        newWidth = width || img.width;
        newHeight = height || img.height;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `resized_${file.name}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
        resolve();
      }, file.type);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function handleAspectRatioChange() {
  if (preserveAspectRatio.checked) {
    if (widthInput.value) {
      heightInput.disabled = true;
    } else if (heightInput.value) {
      widthInput.disabled = true;
    }
  } else {
    widthInput.disabled = false;
    heightInput.disabled = false;
  }
}

function handleDimensionInput(e) {
  if (preserveAspectRatio.checked) {
    if (e.target === widthInput) {
      heightInput.value = '';
      heightInput.disabled = true;
      widthInput.disabled = false;
    } else {
      widthInput.value = '';
      widthInput.disabled = true;
      heightInput.disabled = false;
    }
  }
}

function updateStatus(message) {
  status.textContent = message;
}

init();