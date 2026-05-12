import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  toggleChange = new Subject<boolean>();
  archiveChange = new Subject<boolean>();

  isOpen = false;
  isArchive = false;

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleChange.next(this.isOpen);
  }

  showArchive() {
    this.isArchive = true;
    this.archiveChange.next(this.isArchive);
  }

  hideArchive() {
    this.isArchive = false;
    this.archiveChange.next(this.isArchive);
  }
}
