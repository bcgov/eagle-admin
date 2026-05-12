import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class StorageService {
    private currentState: any;

    constructor() {
        this.currentState = {
        };
    }

    get state(): any { return this.currentState; }
    set state(state: any) { this.currentState[state.type] = state.data; }

    /** Raw project object from the current route resolver. */
    get currentProjectData(): any {
        return this.currentState.currentProject?.data ?? null;
    }
}
