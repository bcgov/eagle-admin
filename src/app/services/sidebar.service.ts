import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() archiveChange: EventEmitter<boolean> = new EventEmitter();

  isOpen = false;
  isArchive = false;

  constructor() { }

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleChange.emit(this.isOpen);
  }

  showArchive() {
    this.isArchive = true;
    this.archiveChange.emit(this.isArchive);
  }

  hideArchive() {
    this.isArchive = false;
    this.archiveChange.emit(this.isArchive);
  }
}
