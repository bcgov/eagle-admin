import { Injectable, inject } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

@Injectable()
export class NavigationStackUtils {
    private storageService = inject(StorageService);


    public getNavigationStack() {
        if (this.storageService.state.navigationStack) {
            return this.storageService.state.navigationStack;
        } else {
            return null;
        }
    }

    public getLastBackUrl() {
        const stack = this.getNavigationStack();
        if (stack) {
            return stack[stack.length - 1].backUrl;
        } else {
            return null;
        }
    }

    public getLastNavigationObject() {
        const stack = this.getNavigationStack();
        if (stack) {
            return stack[stack.length - 1];
        } else {
            return null;
        }
    }

    /*
    Example of a back Url array:
    ['/p', this.project._id, 'edit']

    Example of a breadcrumbs array:
    Note that the objects in the array contain a route and a label.
    [
        {
            route: ['/projects'],
            label: 'All Projects'
        },
        {
            route: ['/p', this.project._id],
            label: this.project.name
        },
        {
            route: ['/p', this.project._id, 'edit'],
            label: 'Edit'
        }
    ]
    */
    public pushNavigationStack(backUrl: Array<string>, breadcrumbs: Array<object>, componentId: string = null) {
        const navigationObject = {
            backUrl: backUrl,
            breadcrumbs: breadcrumbs,
            componentId: componentId
        };
        const stack = this.getNavigationStack();
        if (stack) {
            stack.push(navigationObject);
            this.storageService.state.navigationStack = stack;
        } else {
            this.storageService.state.navigationStack = [navigationObject];
        }
    }

    public popNavigationStack() {
        const stack = this.getNavigationStack();
        if (stack) {
            let stackObject = stack.pop();
            if (stack.length === 0) {
                this.clearNavigationStack();
                stackObject = null;
            } else {
                this.storageService.state.navigationStack = stack;
            }
            return stackObject;
        } else {
            this.clearNavigationStack();
            return null;
        }
    }

    public navigateBreadcrumb(breadcrumb, router) {
        const stack = this.getNavigationStack();
        let poppedItem = null;
        let isPopping = true;
        if (stack) {
            while (isPopping) {
                poppedItem = this.popNavigationStack();
                if (poppedItem == null) {
                    break;
                } else if (poppedItem.breadcrumbs[poppedItem.breadcrumbs.length - 1] === breadcrumb) {
                    isPopping = false;
                }
            }
            router.navigate(breadcrumb.route);
        } else {
            router.navigate(['/']);
        }
    }

    public clearNavigationStack() {
        this.storageService.state.navigationStack = null;
    }
}
