export class RecentActivity {
    _id: string;
    project: any;
    projectNotification: any;
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
        this._id = obj?._id ?? null;
        this.type = obj?.type ?? null;
        this.pcp = obj?.pcp ?? null;
        this.project = obj?.project ?? null;
        this.projectNotification = obj?.projectNotification ?? null;
        this.dateAdded = obj?.dateAdded ?? null;
        this.content = obj?.content ?? null;
        this.documentUrl = obj?.documentUrl ?? null;
        this.contentUrl = obj?.contentUrl ?? null;
        this.notificationName = obj?.notificationName ?? null;
        this.headline = obj?.headline ?? null;
        this.active = obj?.active ?? null;
        this.pinned = obj?.pinned ?? null;
        this.complianceAndEnforcement = obj?.complianceAndEnforcement ?? null;
    }
}
