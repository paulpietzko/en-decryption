import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EncryptionService } from '../services/encryption.service';
import { PasswordValidationService } from '../services/password-validation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { faUpload, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatTooltipModule,
    FontAwesomeModule,
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line
})
export class FileUploadComponent {
  faUpload = faUpload;
  faFile = faFile;

  fileContent: string | ArrayBuffer | null = null;
  fileName: string = '';
  fileSize: number = 0;
  password: string = '';
  selectedMethod: string = 'AES';

  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  uploadProgress: number = 0;

  private reader: FileReader | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private encryptionService: EncryptionService,
    private passwordValidationService: PasswordValidationService
  ) {}

  onFileChange(event: any): void {
    const file = event.target.files[0] as File | null;
    this.uploadFile(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0] as File | null;
    this.uploadFile(file);
  }

  uploadFile(file: File | null): void {
    if (file) {
      this.fileName = file.name;
      this.fileSize = file.size / (1024 * 1024);
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

  cancelUpload(): void {
    if (this.reader) {
      this.reader.abort();
      this.uploadProgress = 0;
      this.fileName = '';
      this.fileSize = 0;
      this.fileContent = null;
      this.uploadSuccess = false;
      this.uploadError = false;
      this.showSnackBar('File upload cancelled!', 'error');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  encryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }

    if (!this.passwordValidationService.isPasswordStrong(this.password)) {
      this.showSnackBar('Password does not meet requirements!', 'error');
      return;
    }

    const contentStr = this.fileContent.toString();
    const encryptedWithMac = this.encryptionService.encrypt(contentStr, this.password, this.selectedMethod);

    this.downloadFile(encryptedWithMac, `${this.fileName}.encrypted`);
    this.showSnackBar('File encrypted successfully!', 'success');
  }

  decryptFile(): void {
    if (!this.fileContent) {
      alert('No file loaded');
      return;
    }

    const decryptedText = this.encryptionService.decrypt(this.fileContent.toString(), this.password, this.selectedMethod);

    if (decryptedText === null) {
      this.showSnackBar('File integrity check failed!', 'error');
      alert('File integrity check failed!');
      return;
    }

    this.downloadFile(decryptedText, this.fileName.replace('.encrypted', ''));
    this.showSnackBar('File decrypted successfully!', 'success');
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

  showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type,
    });
  }
}
