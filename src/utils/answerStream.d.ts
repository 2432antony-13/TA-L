export function readAnswerStream(reader: ReadableStreamDefaultReader<Uint8Array>, onText: (text: string) => void): Promise<void>
