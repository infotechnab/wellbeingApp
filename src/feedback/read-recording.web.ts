/** A finished recording's bytes. Browsers record WebM (Chrome, Firefox, Edge) or MP4 (Safari). */
export async function readRecording(uri: string) {
  const blob = await (await fetch(uri)).blob();
  const contentType = blob.type.split(';')[0] || 'audio/webm';
  const extension = contentType === 'audio/mp4' ? '.m4a' : contentType === 'audio/ogg' ? '.ogg' : '.webm';
  return { bytes: await blob.arrayBuffer(), contentType, extension };
}
