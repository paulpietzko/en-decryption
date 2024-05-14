import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  encrypt(content: string, password: string, method: string): string {
    let encrypted: string;

    switch (method) {
      case 'DES':
        encrypted = CryptoJS.DES.encrypt(content, password).toString();
        break;
      case 'TripleDES':
        encrypted = CryptoJS.TripleDES.encrypt(content, password).toString();
        break;
      case 'Rabbit':
        encrypted = CryptoJS.Rabbit.encrypt(content, password).toString();
        break;
      case 'RC4':
        encrypted = CryptoJS.RC4.encrypt(content, password).toString();
        break;
      case 'AES':
      default:
        encrypted = CryptoJS.AES.encrypt(content, password).toString();
        break;
    }

    const mac = CryptoJS.HmacSHA256(encrypted, password).toString();
    return encrypted + ':' + mac;
  }

  decrypt(encryptedWithMac: string, password: string, method: string): string | null {
    const [encrypted, mac] = encryptedWithMac.split(':');

    const newMac = CryptoJS.HmacSHA256(encrypted, password).toString();
    if (newMac !== mac) {
      return null;
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

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
