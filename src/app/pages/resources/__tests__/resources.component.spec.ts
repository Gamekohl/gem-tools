import {Clipboard} from "@angular/cdk/clipboard";
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ElementRef, PLATFORM_ID} from "@angular/core";
import {TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTreeModule} from '@angular/material/tree';
import {createComponent} from "@testing/utils/testbed";
import {ResourceNode} from "../../../../interfaces";
import {structureData} from "../data/structure";
import {ResourcesComponent} from '../resources.component';

const mockData = structureData;

jest.mock('../data/structure');

describe('ResourcesComponent', () => {
  let component: ResourcesComponent;

  beforeEach(async () => {
    const result = await createComponent(ResourcesComponent, {
      imports: [ResourcesComponent, ReactiveFormsModule, MatTreeModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });

    component = result.component;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter the tree based on the query', () => {
    component.search.set('Node1');
    expect(component.viewData()).toEqual([mockData[0]]);

    component.search.set('');
    expect(component.viewData()).toEqual(mockData);
  });

  it('should highlight text in getText when query matches', () => {
    component.search.set('Node');
    const result = component.getText('Node1');
    expect(result).toContain('<mark>Node</mark>1');

    component.search.set('');
    const noHighlight = component.getText('Node1');
    expect(noHighlight).toBe('Node1');
  });

  it('should copy name to clipboard', () => {
    const clipboard = TestBed.inject(Clipboard);
    const snackbar = TestBed.inject(MatSnackBar);

    const clipboardSpy = jest.spyOn(clipboard, 'copy');
    const snackbarSpy = jest.spyOn(snackbar, 'open');

    component.copyName('Node1');
    expect(clipboardSpy).toHaveBeenCalledWith('Node1');
    expect(snackbarSpy).toHaveBeenCalledWith('"Node1" copied to clipboard', '', { duration: 2000 });
  });

    it('should correctly resolve preview url from resource node', () => {
        let mockNode: ResourceNode = {
            id: 'test',
            name: 'Test',
            children: [],
            path: '/test/object'
        }

        expect(component.resolvePreviewUrl(mockNode)).toEqual('/objects/test/object.webp');

        mockNode = {
            ...mockNode,
            path: null
        } as any

        expect(component.resolvePreviewUrl(mockNode)).toEqual(null);
    });

    it('applyFilter should collapseAll and expand matching paths when query length >= 3 (browser)', () => {
        component['_data'] = [
            {
                id: 'root',
                name: 'Root',
                children: [{id: 'n1', name: 'Node1', children: [], path: ''}],
                path: ''
            },
        ];

        const mockTree = {
            collapseAll: jest.fn(),
            expand: jest.fn(),
        };

        (component as any).tree = () => mockTree;

        component.search.set('Node');
        mockTree.collapseAll.mockClear();
        mockTree.expand.mockClear();

        component.applyFilter();

        expect(mockTree.collapseAll).toHaveBeenCalledTimes(1);

        expect(mockTree.expand).toHaveBeenCalled();
        expect(mockTree.expand).toHaveBeenCalledWith(
            expect.objectContaining({name: 'Root'})
        );
    });

    it('applyFilter should collapseAll but not expand when query length < 3 (browser)', () => {
        component['_data'] = [
            {
                id: 'root',
                name: 'Root',
                children: [{id: 'n1', name: 'Node1', children: [], path: ''}],
                path: ''
            },
        ];

        const mockTree = {
            collapseAll: jest.fn(),
            expand: jest.fn(),
        };
        (component as any).tree = () => mockTree;

        component.search.set('No');
        component.applyFilter();

        expect(mockTree.collapseAll).toHaveBeenCalledTimes(1);
        expect(mockTree.expand).not.toHaveBeenCalled();
    });

    it('applyFilter should do nothing on server platform', async () => {
        TestBed.resetTestingModule();

        await TestBed.configureTestingModule({
            imports: [ResourcesComponent, ReactiveFormsModule, MatTreeModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {provide: PLATFORM_ID, useValue: 'server'},
            ],
        }).compileComponents();

        const serverFixture = TestBed.createComponent(ResourcesComponent);
        const serverComponent = serverFixture.componentInstance;
        serverFixture.detectChanges();

        const mockTree = {collapseAll: jest.fn(), expand: jest.fn()};
        (serverComponent as any).tree = () => mockTree;

        serverComponent.search.set('Node');
        serverComponent.applyFilter();

        expect(mockTree.collapseAll).not.toHaveBeenCalled();
        expect(mockTree.expand).not.toHaveBeenCalled();
    });

    it('should open preview with ElementRef and node', () => {
        const el = document.createElement('div');

        const node: ResourceNode = {
            id: 'n1',
            name: 'Node1',
            children: [],
            path: '/some/path',
        };

        const openSpy = jest.fn();

        (component as any).preview = () => ({
            open: openSpy,
            close: jest.fn(),
        });

        component.openPreview(el, node);

        expect(openSpy).toHaveBeenCalledTimes(1);

        const [argElRef, argNode] = openSpy.mock.calls[0];

        expect(argElRef).toBeInstanceOf(ElementRef);
        expect(argElRef.nativeElement).toBe(el);
        expect(argNode).toBe(node);
    });

    it('should close preview', () => {
        const closeSpy = jest.fn();

        (component as any).preview = () => ({
            open: jest.fn(),
            close: closeSpy,
        });

        component.closePreview();

        expect(closeSpy).toHaveBeenCalledTimes(1);
    });
});
