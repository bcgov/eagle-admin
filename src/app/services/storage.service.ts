import { Injectable } from '@angular/core';
@Injectable()
export class StorageService {
    private currentState: any;

    constructor() {
        this.currentState = {
        };
    }

    get state(): any { return this.currentState; }
    set state(state: any) { this.currentState[state.type] = state.data; }
}
