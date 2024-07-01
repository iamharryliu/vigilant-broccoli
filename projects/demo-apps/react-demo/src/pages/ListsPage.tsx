import React from 'react';

const ListsPage = () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

  return (
    <>
      <h2>List Examples</h2>
      {items.map(item => (
        <div key={item.id}>{JSON.stringify(item)}</div>
      ))}
    </>
  );
};

export default ListsPage;
