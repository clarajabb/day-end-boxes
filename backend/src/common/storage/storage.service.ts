import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(file: any, path: string): Promise<string> {
    // Implementation will be added in next phase
    return 'https://example.com/uploaded-file.jpg';
  }

  async deleteFile(url: string): Promise<void> {
    // Implementation will be added in next phase
  }
}
