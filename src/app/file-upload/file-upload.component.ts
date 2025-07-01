//
// inspired by http://www.advancesharp.com/blog/1218/angular-4-upload-files-with-data-and-web-api-by-drag-drop
//
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    standalone: true,
    imports: [
      CommonModule
    ]
})

export class FileUploadComponent {
  public dragDropClass = 'dragarea';
  @Input() fileExt = 'jpg, jpeg, gif, png, bmp, doc, docx, xls, xlsx, ppt, pptx, pdf, txt';
  @Input() maxFiles = 50;
  @Input() maxSize = 3000; // in MB
  // increase from 300 to 3000 01/19/2023 MS
  @Input() files: Array<File> = [];
  @Input() showInfo = true;
  @Input() showList = true;
  @Output() filesChange = new EventEmitter();
  public errors: Array<string> = [];

  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragDropClass = 'droparea';
    event.preventDefault();
  }

  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragDropClass = 'droparea';
    event.preventDefault();
  }

  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
  }

  @HostListener('drop', ['$event']) onDrop(event) {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
    event.stopPropagation();
    this.addFiles(event.dataTransfer.files);
  }

  onFileChange(event) {
    const files = event.target.files;
    this.addFiles(files);
  }

  addFiles(files: FileList) {
    this.errors = []; // clear previous errors

    if (this.isValidFiles(files)) {
      for (let i = 0; i < files.length; i++) {
        this.files.push(files[i]);
      }
      this.filesChange.emit(this.files);
    }
  }
  removeFile(file: File) {
    this.errors = []; // clear previous errors

    const index = this.files.indexOf(file);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
    this.filesChange.emit(this.files);
  }

  private isValidFiles(files: FileList): boolean {
    if (this.maxFiles > 0) { this.validateMaxFiles(files); }
    if (this.fileExt.length > 0) { this.validateFileExtensions(files); }
    if (this.maxSize > 0) { this.validateFileSizes(files); }
    return (this.errors.length === 0);
  }

  private validateMaxFiles(files: FileList): boolean {
    if ((files.length + this.files.length) > this.maxFiles) {
      this.errors.push('Too many files');
      setTimeout(() => this.errors = [], 5000);
      return false;
    }
    return true;
  }

  private validateFileExtensions(files: FileList): boolean {
    let ret = true;
    const extensions = this.fileExt.split(',').map(function (x) { return x.toUpperCase().trim(); });
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
      if (!extensions.includes(ext)) {
        this.errors.push('Invalid extension: ' + files[i].name);
        setTimeout(() => this.errors = [], 5000);
        ret = false;
      }
    }
    return ret;
  }

  private validateFileSizes(files: FileList): boolean {
    let ret = true;
    for (let i = 0; i < files.length; i++) {
      const fileSizeinMB = files[i].size / 1024 / 1024; // in MB
      const size = Math.round(fileSizeinMB * 100) / 100; // convert up to 2 decimal places
      if (size > this.maxSize) {
        this.errors.push('File too large: ' + files[i].name);
        setTimeout(() => this.errors = [], 5000);
        ret = false;
      }
    }
    return ret;
  }
}
