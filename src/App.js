import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const SNAP_THRESHOLD = 10;

const DraggableResizableDiv = React.memo(function ({
  div,
  onDragStart,
  onResizeStart,
  onRemove,
}) {
  return (
    <div
      onMouseDown={(e) => onDragStart(e, div.id)}
      className="draggable-div"
      style={{
        left: div.x,
        top: div.y,
        width: div.width,
        height: div.height,
        backgroundColor: div.color,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(div.id);
        }}
        className="remove-button"
        aria-label="Remove div"
      >
        ×
      </button>

      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e, div.id);
        }}
        className="resize-handle"
      />
    </div>
  );
});

function DraggableResizableDivs() {
  const [divs, setDivs] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);

  const addDiv = () => {
    setDivs((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: 50,
        y: 50,
        width: 45,
        height: 45,
        color:
          '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0'),
      },
    ]);
  };

  const onDragStart = useCallback(
    (e, id) => {
      e.preventDefault();
      const div = divs.find((d) => d.id === id);
      if (!div) return;
      setDragging({
        id,
        offsetX: e.clientX - div.x,
        offsetY: e.clientY - div.y,
      });
    },
    [divs]
  );

  const onResizeStart = useCallback(
    (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      const div = divs.find((d) => d.id === id);
      if (!div) return;
      setResizing({
        id,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: div.width,
        startHeight: div.height,
      });
    },
    [divs]
  );

  useEffect(() => {
    function onMouseMove(e) {
      if (dragging) {
        const { id, offsetX, offsetY } = dragging;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const currentDiv = divs.find((d) => d.id === id);
        if (!currentDiv) return;

        divs.forEach((d) => {
          if (d.id === id) return;

          // Snap X axis
          if (Math.abs(newX - (d.x + d.width)) < SNAP_THRESHOLD) {
            newX = d.x + d.width;
          } else if (
            Math.abs(newX + currentDiv.width - d.x) < SNAP_THRESHOLD
          ) {
            newX = d.x - currentDiv.width;
          }

          // Snap Y axis
          if (Math.abs(newY - (d.y + d.height)) < SNAP_THRESHOLD) {
            newY = d.y + d.height;
          } else if (
            Math.abs(newY + currentDiv.height - d.y) < SNAP_THRESHOLD
          ) {
            newY = d.y - currentDiv.height;
          }
        });

        // Snap to wrapper edges
        if (Math.abs(newX) < SNAP_THRESHOLD) newX = 0;
        if (Math.abs(newY) < SNAP_THRESHOLD) newY = 0;

        setDivs((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, x: newX, y: newY } : d
          )
        );
      } else if (resizing) {
        const { id, startX, startY, startWidth, startHeight } = resizing;
        let newWidth = Math.max(10, startWidth + e.clientX - startX);
        let newHeight = Math.max(10, startHeight + e.clientY - startY);

        const currentDiv = divs.find((d) => d.id === id);
        if (!currentDiv) return;

        divs.forEach((d) => {
          if (d.id === id) return;

          // Snap width
          if (
            Math.abs(currentDiv.x + newWidth - d.x) < SNAP_THRESHOLD
          ) {
            newWidth = d.x - currentDiv.x;
          } else if (
            Math.abs(currentDiv.x + newWidth - (d.x + d.width)) <
            SNAP_THRESHOLD
          ) {
            newWidth = d.x + d.width - currentDiv.x;
          }

          // Snap height
          if (
            Math.abs(currentDiv.y + newHeight - d.y) < SNAP_THRESHOLD
          ) {
            newHeight = d.y - currentDiv.y;
          } else if (
            Math.abs(currentDiv.y + newHeight - (d.y + d.height)) <
            SNAP_THRESHOLD
          ) {
            newHeight = d.y + d.height - currentDiv.y;
          }
        });

        setDivs((prev) =>
          prev.map((d) =>
            d.id === id
              ? { ...d, width: newWidth, height: newHeight }
              : d
          )
        );
      }
    }

    function onMouseUp() {
      setDragging(null);
      setResizing(null);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, resizing, divs]);

  const removeDiv = useCallback((id) => {
    setDivs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <div className={`wrapper ${dragging || resizing ? 'no-select' : ''}`}>
      <button onClick={addDiv} className="add-button">
        Add Draggable & Resizable Div
      </button>

      {divs.map((div) => (
        <DraggableResizableDiv
          key={div.id}
          div={div}
          onDragStart={onDragStart}
          onResizeStart={onResizeStart}
          onRemove={removeDiv}
        />
      ))}
    </div>
  );
}

export default DraggableResizableDivs;
