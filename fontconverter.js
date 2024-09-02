import { Font } from 'fonteditor-core';

export function convertTTFtoWOFF(ttfBuffer) {
    return new Promise((resolve, reject) => {
        try {
            const font = Font.create(ttfBuffer, {
                type: 'ttf',
                hinting: true,
                compound2simple: true,
                inflate: null,
                combinePath: false,
            });

            const woffBuffer = font.write({
                type: 'woff',
                hinting: true,
            });

            resolve(woffBuffer);
        } catch (error) {
            reject(error);
        }
    });
}

export function handleFileConversion(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const ttfBuffer = event.target.result;
                const woffBuffer = await convertTTFtoWOFF(ttfBuffer);
                const woffBlob = new Blob([woffBuffer], { type: 'font/woff' });
                resolve(woffBlob);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}