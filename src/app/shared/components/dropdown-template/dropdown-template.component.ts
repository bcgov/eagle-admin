import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-dropdown-template',
    templateUrl: './dropdown-template.component.html',
    styleUrls: ['./dropdown-template.component.scss'],
    standalone: false
})

export class DropdownTemplateComponent {
    @Input() items: any;
    @Output() itemSelected: EventEmitter<any> = new EventEmitter();

    itemClicked(item) {
        this.itemSelected.emit(item);
    }

}
