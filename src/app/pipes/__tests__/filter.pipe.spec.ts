import { FilterPipe } from '../filter.pipe';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array if items are null', () => {
    const result = pipe.transform(null, 'query');
    expect(result).toEqual([]);
  });

  it('should return the original array if query is empty', () => {
    const items = ['item1', 'item2', 'item3'];
    const result = pipe.transform(items, '');
    expect(result).toEqual(items);
  });

  it('should return the original array if query is not provided', () => {
    const items = ['item1', 'item2', 'item3'];
    const result = pipe.transform(items, '');
    expect(result).toEqual(items);
  });

  it('should filter items based on the query', () => {
    const items = ['apple', 'banana', 'grape', 'orange'];
    const result = pipe.transform(items, 'ap');
    expect(result).toEqual(['apple', 'grape']);
  });

  it('should be case insensitive when filtering', () => {
    const items = ['Apple', 'Banana', 'Grape', 'Orange'];
    const result = pipe.transform(items, 'ap');
    expect(result).toEqual(['Apple', 'Grape']);
  });

  it('should return an empty array if no items match the query', () => {
    const items = ['apple', 'banana', 'grape', 'orange'];
    const result = pipe.transform(items, 'xyz');
    expect(result).toEqual([]);
  });

  it('should handle an empty items array', () => {
    const result = pipe.transform([], 'query');
    expect(result).toEqual([]);
  });
});
