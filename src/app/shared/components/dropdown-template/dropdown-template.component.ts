import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dropdown-template',
    templateUrl: './dropdown-template.component.html',
    styleUrls: ['./dropdown-template.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      MatMenuModule
    ]
})

export class DropdownTemplateComponent {
    @Input() items: any;
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    itemClicked(item) {
        this.itemSelected.emit(item);
    }

}
