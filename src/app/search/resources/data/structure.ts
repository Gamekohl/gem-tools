import structure from './structure.json';

export interface ResourceNode {
    id: string;
    name: string;
    children: ResourceNode[];
    path: string;
}

export const structureData = structure as ResourceNode[];