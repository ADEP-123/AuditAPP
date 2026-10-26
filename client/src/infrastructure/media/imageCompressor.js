// Reduce la imagen a máx. 1600 px y JPEG 85 %: legible en el informe y liviana en el JSON.
export async function compressImage(file, maxSide = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const g = canvas.getContext('2d');
  g.fillStyle = '#fff'; // las transparencias de PNG quedarían negras en JPEG
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
  return { dataUrl, bytes, width: canvas.width, height: canvas.height, size: blob.size, type: 'image/jpeg' };
}
