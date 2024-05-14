import { Component } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { faUpload, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule, MatSnackBarModule, MatTooltipModule],
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
  selectedMethod: string = 'AES';

  // Upload feedback
  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  uploadProgress: number = 0;

  private reader: FileReader | null = null;

  constructor(private snackBar: MatSnackBar) {}

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
        this.showSnackBar('File uploaded successfully!', 'success');
      };
      this.reader.onerror = () => {
        this.uploadError = true;
        this.uploadSuccess = false;
        this.uploadProgress = 0;
        this.showSnackBar('Failed to upload file!', 'error');
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
      this.showSnackBar('File upload cancelled!', 'error');
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

    if (!this.isPasswordStrong(this.password)) {
      this.showSnackBar('Password does not meet requirements!', 'error');
      return;
    }

    const contentStr = this.fileContent.toString();
    let encrypted: string;
    
    switch(this.selectedMethod) {
      case 'DES':
        encrypted = CryptoJS.DES.encrypt(contentStr, this.password).toString();
        break;
      case 'TripleDES':
        encrypted = CryptoJS.TripleDES.encrypt(contentStr, this.password).toString();
        break;
      case 'Rabbit':
        encrypted = CryptoJS.Rabbit.encrypt(contentStr, this.password).toString();
        break;
      case 'RC4':
        encrypted = CryptoJS.RC4.encrypt(contentStr, this.password).toString();
        break;
      case 'AES':
      default:
        encrypted = CryptoJS.AES.encrypt(contentStr, this.password).toString();
        break;
    }

    // Generate the MAC using CBC mode
    const mac = CryptoJS.HmacSHA256(encrypted, this.password).toString();

    // Append the MAC to the encrypted content
    const encryptedWithMac = encrypted + ':' + mac;

    this.downloadFile(encryptedWithMac, `${this.fileName}.encrypted`);
    this.showSnackBar('File encrypted successfully!', 'success');
  }

  // Method to decrypt the file
  decryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }

    const [encrypted, mac] = this.fileContent.toString().split(':');

    // Verify the MAC
    const newMac = CryptoJS.HmacSHA256(encrypted, this.password).toString();

    if (newMac !== mac) {
      this.showSnackBar('File integrity check failed!', 'error');
      alert('File integrity check failed!');
      return;
    }

    let decrypted;
    
    switch(this.selectedMethod) {
      case 'DES':
        decrypted = CryptoJS.DES.decrypt(encrypted, this.password);
        break;
      case 'TripleDES':
        decrypted = CryptoJS.TripleDES.decrypt(encrypted, this.password);
        break;
      case 'Rabbit':
        decrypted = CryptoJS.Rabbit.decrypt(encrypted, this.password);
        break;
      case 'RC4':
        decrypted = CryptoJS.RC4.decrypt(encrypted, this.password);
        break;
      case 'AES':
      default:
        decrypted = CryptoJS.AES.decrypt(encrypted, this.password);
        break;
    }

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    this.downloadFile(decryptedText, this.fileName.replace('.encrypted', ''));
    this.showSnackBar('File decrypted successfully!', 'success');
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

  // Method to show snackbar messages
  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type
    });
  }

  // Method to check password strength
  isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }
}
