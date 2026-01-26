import structure from './structure.json';

export interface ResourceNode {
    name: string;
    children: ResourceNode[];
}

export const structureData = structure as ResourceNode[];