export declare class StorageService {
    uploadFile(file: any, path: string): Promise<string>;
    deleteFile(url: string): Promise<void>;
}
