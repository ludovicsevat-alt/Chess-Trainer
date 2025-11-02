import React from 'react';

export default function CardGrid({ items, renderItem }) {
  return (
    <div className="grid grid-cols-3 gap-8">
      {items.map((item, index) => (
        <React.Fragment key={item.slug || index}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
}
