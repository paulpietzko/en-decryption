import { Component } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  fileContent: string | ArrayBuffer | null = null;
  fileName: string = '';
  password: string = '';

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.fileContent = reader.result;
    };
    reader.readAsText(file);
  }

  encryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(this.fileContent.toString(), this.password).toString();
    this.downloadFile(encrypted, `${this.fileName}.encrypted`);
  }
  
  decryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }
    const decrypted = CryptoJS.AES.decrypt(this.fileContent.toString(), this.password);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    this.downloadFile(decryptedText, this.fileName.replace('.encrypted', ''));
  }

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
