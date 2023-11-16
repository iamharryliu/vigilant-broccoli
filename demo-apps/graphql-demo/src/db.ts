const parents = [
  { id: '1', name: 'name1', child_id: '1' },
  { id: '2', name: 'name2', child_id: '2' },
  { id: '3', name: 'name3', child_id: '3' },
  { id: '4', name: 'name4', child_id: '4' },
  { id: '5', name: 'name5', child_id: '5' },
  { id: '6', name: 'name6', child_id: '6' },
  { id: '7', name: 'name7', child_id: '7' },
];

const childs = [
  { id: '1', name: 'child1', dog_id: '1' },
  { id: '2', name: 'child2', dog_id: '1' },
  { id: '3', name: 'child3', dog_id: '2' },
  { id: '4', name: 'child4', dog_id: '2' },
  { id: '5', name: 'child5', dog_id: '2' },
  { id: '6', name: 'child6', dog_id: '3' },
  { id: '7', name: 'child7', dog_id: '3' },
];

const dogs = [
  { id: '1', name: 'Rocko' },
  { id: '2', name: 'Sparky' },
  { id: '3', name: 'Chip' },
];

export const db = {
  parents: parents,
  childs: childs,
  dogs: dogs,
};
