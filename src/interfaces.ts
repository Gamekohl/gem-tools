export interface ResourceNode {
    id: string;
    name: string;
    children: ResourceNode[];
    path: string;
}