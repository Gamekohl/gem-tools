import structure from './structure.json';

export interface ResourceNode {
    name: string;
    children: ResourceNode[];
    path?: string;
}

export const structureData = structure as ResourceNode[];