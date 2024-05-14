import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
    FontAwesomeModule,
  ],
  exports: [
    CommonModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
    FontAwesomeModule,
  ],
})
export class SharedModule {}
