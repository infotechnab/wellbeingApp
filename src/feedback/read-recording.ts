import { File } from 'expo-file-system';

/** A finished recording's bytes. On phones it's AAC in an .m4a file (see VOICE_RECORDING). */
export async function readRecording(uri: string) {
  return { bytes: await new File(uri).arrayBuffer(), contentType: 'audio/mp4', extension: '.m4a' };
}
