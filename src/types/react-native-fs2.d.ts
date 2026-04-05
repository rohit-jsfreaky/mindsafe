declare module 'react-native-fs2' {
  interface StatResult {
    name: string;
    path: string;
    size: string;
    mode: number;
    ctime: number;
    mtime: number;
    isFile: () => boolean;
    isDirectory: () => boolean;
  }

  interface DownloadFileOptions {
    fromUrl: string;
    toFile: string;
    headers?: Record<string, string>;
    background?: boolean;
    progressInterval?: number;
    progress?: (res: { contentLength: number; bytesWritten: number }) => void;
    begin?: (res: { contentLength: number; statusCode: number; headers: Record<string, string> }) => void;
    resumable?: () => void;
    connectionTimeout?: number;
    readTimeout?: number;
  }

  interface DownloadResult {
    jobId: number;
    statusCode: number;
    bytesWritten: number;
  }

  interface FSInfoResult {
    totalSpace: number;
    freeSpace: number;
  }

  const DocumentDirectoryPath: string;
  const CachesDirectoryPath: string;
  const ExternalDirectoryPath: string;

  function exists(path: string): Promise<boolean>;
  function mkdir(path: string): Promise<void>;
  function unlink(path: string): Promise<void>;
  function stat(path: string): Promise<StatResult>;
  function readFile(path: string, encoding?: string): Promise<string>;
  function writeFile(path: string, content: string, encoding?: string): Promise<void>;
  function downloadFile(options: DownloadFileOptions): { jobId: number; promise: Promise<DownloadResult> };
  function stopDownload(jobId: number): void;
  function getFSInfo(): Promise<FSInfoResult>;

  const _default: {
    DocumentDirectoryPath: string;
    CachesDirectoryPath: string;
    ExternalDirectoryPath: string;
    exists: typeof exists;
    mkdir: typeof mkdir;
    unlink: typeof unlink;
    stat: typeof stat;
    readFile: typeof readFile;
    writeFile: typeof writeFile;
    downloadFile: typeof downloadFile;
    stopDownload: typeof stopDownload;
    getFSInfo: typeof getFSInfo;
  };

  export default _default;
  export {
    DocumentDirectoryPath,
    CachesDirectoryPath,
    ExternalDirectoryPath,
    exists,
    mkdir,
    unlink,
    stat,
    readFile,
    writeFile,
    downloadFile,
    stopDownload,
    getFSInfo,
  };
}
