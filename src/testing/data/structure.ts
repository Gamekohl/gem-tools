import {ResourceNode} from "../../app/search/resources/data/structure";

export const testStructureData: ResourceNode[] = [
    {
        id: 'Node1',
        path: 'Node1',
        name: 'Node1',
        children: [
            {
                id: 'Child1',
                path: 'Node1/Child1',
                name: 'Child1',
                children: []
            }
        ]
    },
    {
        id: 'Node2',
        path: 'Node2',
        name: 'Node2',
        children: []
    },
]