export class RecentActivity {
    _id: string;
    project: any;
    type: string;
    pcp: any;
    dateAdded: string;
    active: boolean;
    headline: string;
    content: string;
    documentUrl: string;
    contentUrl: string;
    notificationName: string;
    pinned: boolean;
    complianceAndEnforcement: boolean;

    constructor(obj?: any) {
        this._id = obj && obj._id || null;
        this.type = obj && obj.type || null;
        this.pcp = obj && obj.pcp || null;
        this.project = obj && obj.project || null;
        this.dateAdded = obj && obj.dateAdded || null;
        this.content = obj && obj.content || null;
        this.documentUrl = obj && obj.documentUrl || null;
        this.contentUrl = obj && obj.contentUrl || null;
        this.notificationName = obj && obj.notificationName || null;
        this.headline = obj && obj.headline || null;
        this.active = obj && obj.active || null;
        this.pinned = obj && obj.pinned || null;
        this.complianceAndEnforcement = obj && obj.complianceAndEnforcement || null;
    }
}
