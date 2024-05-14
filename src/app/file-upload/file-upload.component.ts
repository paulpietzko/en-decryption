import { Component } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { faUpload, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  // Icons
  faUpload = faUpload;
  faFile = faFile;

  fileContent: string | ArrayBuffer | null = null;
  fileName: string = '';
  fileSize: number = 0;
  password: string = '';

  // Upload feedback
  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  uploadProgress: number = 0;
  
  private reader: FileReader | null = null;

  // Method to handle file changes from the input element
  onFileChange(event: any): void {
    const file = event.target.files[0] as File | null;
    this.uploadFile(file);
  }

  // Method to handle file drops
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0] as File | null;
    this.uploadFile(file);
  }

  // Method to upload file
  uploadFile(file: File | null): void {
    if (file) {
      this.fileName = file.name;
      this.fileSize = file.size / (1024 * 1024); // Convert bytes to MB
      this.reader = new FileReader();
      this.reader.onprogress = (event) => {
        if (event.loaded && event.total) {
          this.uploadProgress = (event.loaded / event.total) * 100;
        }
      };
      this.reader.onload = () => {
        this.fileContent = this.reader?.result as string | ArrayBuffer | null;
        this.uploadSuccess = true;
        this.uploadError = false;
        this.uploadProgress = 100;
      };
      this.reader.onerror = () => {
        this.uploadError = true;
        this.uploadSuccess = false;
        this.uploadProgress = 0;
      };
      this.reader.readAsText(file);
    }
  }

  // Method to cancel the upload
  cancelUpload(): void {
    if (this.reader) {
      this.reader.abort();
      this.uploadProgress = 0;
      this.fileName = '';
      this.fileSize = 0;
      this.fileContent = null;
      this.uploadSuccess = false; // Reset success flag
      this.uploadError = false;   // Reset error flag
    }
  }

  // Method to prevent the default behavior during drag over
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Method to encrypt the file
  encryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(this.fileContent.toString(), this.password).toString();
    this.downloadFile(encrypted, `${this.fileName}.encrypted`);
  }

  // Method to decrypt the file
  decryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }
    const decrypted = CryptoJS.AES.decrypt(this.fileContent.toString(), this.password);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    this.downloadFile(decryptedText, this.fileName.replace('.encrypted', ''));
  }

  // Method to download a file
  downloadFile(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
