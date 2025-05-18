import React, { useState, useRef } from 'react';

function DraggableResizableDivs() {
  const [divs, setDivs] = useState([]);
  const draggingId = useRef(null);
  const resizingId = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  const addDiv = () => {
    setDivs(prev => [
      ...prev,
      {
        id: Date.now(),
        x: 50,
        y: 50,
        width: 45,
        height: 45,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
    ]);
  };

  const handleMouseDownDrag = (e, id) => {
    draggingId.current = id;
    resizingId.current = null;
    const div = divs.find(d => d.id === id);
    if (div) {
      offset.current = {
        x: e.clientX - div.x,
        y: e.clientY - div.y,
      };
    }
  };

  const handleMouseDownResize = (e, id) => {
    e.stopPropagation();
    resizingId.current = id;
    draggingId.current = null;
    const div = divs.find(d => d.id === id);
    if (div) {
      offset.current = {
        x: e.clientX,
        y: e.clientY,
        width: div.width,
        height: div.height,
      };
    }
  };

  const handleMouseMove = e => {
    if (draggingId.current !== null) {
      setDivs(prev =>
        prev.map(d => {
          if (d.id === draggingId.current) {
            return {
              ...d,
              x: e.clientX - offset.current.x,
              y: e.clientY - offset.current.y,
            };
          }
          return d;
        })
      );
    } else if (resizingId.current !== null) {
      setDivs(prev =>
        prev.map(d => {
          if (d.id === resizingId.current) {
            const newWidth = Math.max(10, offset.current.width + (e.clientX - offset.current.x));
            const newHeight = Math.max(10, offset.current.height + (e.clientY - offset.current.y));
            return {
              ...d,
              width: newWidth,
              height: newHeight,
            };
          }
          return d;
        })
      );
    }
  };

  const handleMouseUp = () => {
    draggingId.current = null;
    resizingId.current = null;
  };

  // Remove div by id
  const removeDiv = id => {
    setDivs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ width: '100%', height: '100vh', position: 'relative', userSelect: 'none' }}
    >
      <button
        onClick={addDiv}
        style={{ margin: '10px', padding: '10px', cursor: 'pointer' }}
      >
        Add Draggable & Resizable Div
      </button>

      {divs.map(div => (
        <div
          key={div.id}
          onMouseDown={e => handleMouseDownDrag(e, div.id)}
          style={{
            position: 'absolute',
            left: div.x,
            top: div.y,
            width: div.width,
            height: div.height,
            backgroundColor: div.color,
            cursor: 'grab',
            boxSizing: 'border-box',
            border: '1px solid #444',
          }}
        >
          {/* Remove button */}
          <button
            onClick={e => {
              e.stopPropagation();  
              removeDiv(div.id);
            }}
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'red',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
            }}
            aria-label="Remove div"
          >
            ×
          </button>

          {/* Resize handle */}
          <div
            onMouseDown={e => handleMouseDownResize(e, div.id)}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              right: 0,
              bottom: 0,
              backgroundColor: 'darkgrey',
              cursor: 'nwse-resize',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default DraggableResizableDivs;
