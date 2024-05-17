import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as LZString from 'lz-string';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  compress(data: string): string {
    return LZString.compress(data);
  }

  decompress(data: string): string {
    return LZString.decompress(data);
  }

  encrypt(content: string, password: string, method: string): string {
    const compressedContent = this.compress(content);
    let encrypted: string;

    switch (method) {
      case 'DES':
        encrypted = CryptoJS.DES.encrypt(compressedContent, password).toString();
        break;
      case 'TripleDES':
        encrypted = CryptoJS.TripleDES.encrypt(compressedContent, password).toString();
        break;
      case 'Rabbit':
        encrypted = CryptoJS.Rabbit.encrypt(compressedContent, password).toString();
        break;
      case 'RC4':
        encrypted = CryptoJS.RC4.encrypt(compressedContent, password).toString();
        break;
      case 'AES':
      default:
        encrypted = CryptoJS.AES.encrypt(compressedContent, password).toString();
        break;
    }

    const mac = CryptoJS.HmacSHA256(encrypted, password).toString();
    return `${encrypted}:${mac}`;
  }

  decrypt(content: string, password: string, method: string): string {
    const [encrypted, mac] = content.split(':');
    const newMac = CryptoJS.HmacSHA256(encrypted, password).toString();

    if (newMac !== mac) {
      throw new Error('File integrity check failed!');
    }

    let decrypted;

    switch (method) {
      case 'DES':
        decrypted = CryptoJS.DES.decrypt(encrypted, password);
        break;
      case 'TripleDES':
        decrypted = CryptoJS.TripleDES.decrypt(encrypted, password);
        break;
      case 'Rabbit':
        decrypted = CryptoJS.Rabbit.decrypt(encrypted, password);
        break;
      case 'RC4':
        decrypted = CryptoJS.RC4.decrypt(encrypted, password);
        break;
      case 'AES':
      default:
        decrypted = CryptoJS.AES.decrypt(encrypted, password);
        break;
    }

    const decompressedContent = this.decompress(decrypted.toString(CryptoJS.enc.Utf8));
    return decompressedContent;
  }
}
