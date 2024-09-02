import './style.css'
import { handleFileConversion } from './fontconverter';

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('ttfFile');
  const convertButton = document.getElementById('convertButton');
  const status = document.getElementById('status');

  convertButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      status.textContent = 'Please select a TTF file.';
      return;
    }

    status.textContent = 'Converting...';
    try {
      const woffBlob = await handleFileConversion(file);
      const downloadUrl = URL.createObjectURL(woffBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = file.name.replace('.ttf', '.woff');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      status.textContent = 'Conversion complete! Download started.';
    } catch (error) {
      console.error('Conversion failed:', error);
      status.textContent = 'Conversion failed. Please try again.';
    }
  });
});